import { useEffect } from 'react';
import { SILENT_WEBM, SILENT_MP4 } from '../utils/wakeLockMedia';

/**
 * Hook متكامل وشامل لمنع انطفاء الشاشة أو تفعيل وضع السكون (Ultra 24/7 Keep-Alive System)
 * مصمم خصيصاً لشاشات التلفزيون الذكية (Smart TV: Samsung Tizen, LG webOS, Android TV, Fire TV, PC Kiosk).
 * 
 * يتضمن 4 طبقات حماية متزامنة:
 * 1. Screen Wake Lock API الأصلي للمتصفح.
 * 2. فيديو صامت مزدوج حقيقي (WebM + MP4 H.264) يعمل بحلقة مستمرة دون توقف.
 * 3. نظام Web Audio API للوسائط الصوتية الصامتة لمنع المعالج من تفعيل سكون الشاشة.
 * 4. مراقب نشاط تلقائي (Watchdog) يعيد التفعيل فوراً كل 5 ثوانٍ وعند أي إشارة من ريموت التلفاز.
 */
export const useWakeLock = () => {
  useEffect(() => {
    let wakeLock = null;
    let isLocked = false;
    let videoEl = null;
    let audioCtx = null;
    let isDestroyed = false;

    // ==========================================
    // 1. مشغل الفيديو الصامت فائق التوافق (Layer 1)
    // ==========================================
    const initKeepAliveVideo = () => {
      try {
        let existing = document.getElementById('handyland-keep-alive-video');
        if (existing) {
          videoEl = existing;
          if (videoEl.paused) videoEl.play().catch(() => {});
          return;
        }

        videoEl = document.createElement('video');
        videoEl.id = 'handyland-keep-alive-video';
        videoEl.setAttribute('title', 'Handyland Display Keep-Alive');
        videoEl.setAttribute('playsinline', '');
        videoEl.setAttribute('webkit-playsinline', '');
        videoEl.setAttribute('muted', '');
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.loop = true;
        videoEl.autoplay = true;

        // إضافة صيغتي الفيديو الصامت القياسيتين (WebM للمتصفحات الحديثة و MP4 لـ Safari/Tizen/webOS)
        const addSource = (type, dataUri) => {
          const src = document.createElement('source');
          src.src = dataUri;
          src.type = `video/${type}`;
          videoEl.appendChild(src);
        };

        addSource('webm', SILENT_WEBM);
        addSource('mp4', SILENT_MP4);

        // حيلة استمرار التشغيل اللانهائي دون أي انقطاع
        videoEl.addEventListener('timeupdate', () => {
          if (videoEl.currentTime > 0.5) {
            videoEl.currentTime = 0.05;
          }
        });

        videoEl.addEventListener('ended', () => {
          if (!isDestroyed && videoEl.paused) {
            videoEl.play().catch(() => {});
          }
        });

        videoEl.addEventListener('pause', () => {
          if (!isDestroyed) {
            videoEl.play().catch(() => {});
          }
        });

        // تموضع في زاوية الشاشة لضمان عدم إيقاف معالج كرت الشاشة في التلفاز لتصيير الفيديو
        videoEl.style.position = 'fixed';
        videoEl.style.bottom = '1px';
        videoEl.style.right = '1px';
        videoEl.style.width = '2px';
        videoEl.style.height = '2px';
        videoEl.style.opacity = '0.005';
        videoEl.style.pointerEvents = 'none';
        videoEl.style.zIndex = '999999';

        document.body.appendChild(videoEl);

        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // سيعاد التشغيل فوراً عند أول لمس أو ضغطة ريموت
          });
        }
      } catch (err) {
        console.warn('Video keep-alive notice:', err);
      }
    };

    // ==========================================
    // 2. نظام الصوت الصامت Web Audio API (Layer 2)
    // تبقي معالج الصوت بنظام التلفاز في حالة نشاط دائم
    // ==========================================
    const initKeepAliveAudio = () => {
      try {
        if (audioCtx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        audioCtx = new AudioContextClass();
        
        // مذبذب صوتي بتردد منخفض جداً غير مسموع إطلاقاً وبحجم 0.00001
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(20, audioCtx.currentTime); // تردد تحت الصوتي (Inaudible 20Hz)
        gainNode.gain.setValueAtTime(0.00001, audioCtx.currentTime); // صامت تماماً
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();

        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
      } catch (e) {
        // متصفح قديم لا يدعم Web Audio
      }
    };

    // ==========================================
    // 3. قفل الشاشة الرسمي Screen Wake Lock (Layer 3)
    // ==========================================
    const requestWakeLock = async () => {
      if (document.visibilityState !== 'visible' || isDestroyed) return;

      try {
        if ('wakeLock' in navigator && (!isLocked || !wakeLock)) {
          wakeLock = await navigator.wakeLock.request('screen');
          isLocked = true;
          console.log('✅ Screen Wake Lock API: Active (الشاشة محمية من السكون)');

          wakeLock.addEventListener('release', () => {
            isLocked = false;
            wakeLock = null;
            // إعادة المحاولة فوراً إذا فُك القفل تلقائياً
            if (!isDestroyed && document.visibilityState === 'visible') {
              setTimeout(requestWakeLock, 500);
            }
          });
        }
      } catch (err) {
        isLocked = false;
      }

      // التأكد من استمرار تشغيل الفيديو الصامت
      if (videoEl && videoEl.paused) {
        videoEl.play().catch(() => {});
      }

      // التأكد من استمرار تشغيل الصوت الصامت
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    };

    // بدء تشغيل كافة طبقات الحماية فوراً
    initKeepAliveVideo();
    initKeepAliveAudio();
    requestWakeLock();

    // ==========================================
    // 4. مراقب تفاعل المستخدم وريموت التلفاز (Layer 4)
    // أي ضغطة ريموت تنشط وتجدد كافة الأقفال فوراً
    // ==========================================
    const handleActivePulse = () => {
      if (!isLocked) {
        requestWakeLock();
      }
      if (videoEl && videoEl.paused) {
        videoEl.play().catch(() => {});
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
        if (videoEl && videoEl.paused) videoEl.play().catch(() => {});
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      }
    };

    // أحداث الشاشة وتفاعل الريموت
    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleVisibilityChange);
    document.addEventListener('webkitfullscreenchange', handleVisibilityChange);

    window.addEventListener('keydown', handleActivePulse, { passive: true });
    window.addEventListener('pointerdown', handleActivePulse, { passive: true });
    window.addEventListener('touchstart', handleActivePulse, { passive: true });
    window.addEventListener('click', handleActivePulse, { passive: true });

    // ==========================================
    // 5. حارس المراقبة الدوري (Watchdog Timer كل 5 ثوانٍ)
    // ==========================================
    const watchdogTimer = setInterval(() => {
      if (isDestroyed) return;

      // 1. إعادة قفل الشاشة إذا فُقد
      if (!isLocked && document.visibilityState === 'visible') {
        requestWakeLock();
      }

      // 2. إعادة تشغيل الفيديو إذا توقف لأي سبب
      if (videoEl && videoEl.paused) {
        videoEl.play().catch(() => {});
      }

      // 3. إعادة تشغيل الصوت إذا علق في وضع التعليق
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    }, 5000);

    return () => {
      isDestroyed = true;
      clearInterval(watchdogTimer);

      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleVisibilityChange);
      document.removeEventListener('webkitfullscreenchange', handleVisibilityChange);

      window.removeEventListener('keydown', handleActivePulse);
      window.removeEventListener('pointerdown', handleActivePulse);
      window.removeEventListener('touchstart', handleActivePulse);
      window.removeEventListener('click', handleActivePulse);

      if (wakeLock !== null) {
        wakeLock.release().catch(() => {});
      }

      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }

      if (videoEl && videoEl.parentNode) {
        videoEl.parentNode.removeChild(videoEl);
      }
    };
  }, []);
};
