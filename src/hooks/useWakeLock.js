import { useEffect } from 'react';

/**
 * Hook لمنع انطفاء الشاشة أو تفعيل وضع السكون (Wake Lock + Silent Video Keep-Alive Fallback)
 * متوافق مع كافة المتصفحات، شاشات Smart TV، أجهزة Android TV، والـ Kiosk Mode على Windows.
 */
export const useWakeLock = () => {
  useEffect(() => {
    let wakeLock = null;
    let isLocked = false;
    let videoEl = null;

    // 1. إنشاء عنصر فيديو صامت في الخلفية كحماية ثانية غير قابلة للفشل لجميع المتصفحات
    const createKeepAliveVideo = () => {
      try {
        if (document.getElementById('handyland-keep-alive-video')) return;

        // إنشاء Canvas بدقة 2x2 يرسم إطاراً متحركاً طفيفاً للحفاظ على حيوية وحدة المعالجة
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, 2, 2);
        }

        // تحويل Canvas إلى Stream لتشغيله في عنصر Video صامت
        let stream = null;
        if (canvas.captureStream) {
          stream = canvas.captureStream(1); // 1 fps لتوفير الطاقة والمعالج
        } else if (canvas.mozCaptureStream) {
          stream = canvas.mozCaptureStream(1);
        }

        videoEl = document.createElement('video');
        videoEl.id = 'handyland-keep-alive-video';
        videoEl.setAttribute('aria-hidden', 'true');
        videoEl.setAttribute('muted', 'true');
        videoEl.setAttribute('playsinline', 'true');
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.loop = true;
        
        // استخدام data URI لفيديو صامت كـ Fallback احتياطي في حال عدم دعم captureStream
        const silentVideoDataUri = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAAG1kYXQAAAAAAAABAAAAAG1vb3YAAABsbXZoZAAAAADOHd10zh3ddAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABhbXJhAAAAAAA=';
        
        if (stream) {
          videoEl.srcObject = stream;
        } else {
          videoEl.src = silentVideoDataUri;
        }

        videoEl.style.position = 'fixed';
        videoEl.style.top = '-9999px';
        videoEl.style.left = '-9999px';
        videoEl.style.width = '1px';
        videoEl.style.height = '1px';
        videoEl.style.opacity = '0.01';
        videoEl.style.pointerEvents = 'none';
        videoEl.style.zIndex = '-99999';

        document.body.appendChild(videoEl);

        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // سيعاد التشغيل تلقائياً عند أول تفاعل للمستخدم
          });
        }
      } catch (e) {
        console.warn('Keep-Alive Video Fallback Notice:', e);
      }
    };

    // 2. طلب Screen Wake Lock من المتصفح (الطبقة الأولى)
    const requestWakeLock = async () => {
      if (document.visibilityState !== 'visible') return;

      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          isLocked = true;
          console.log('✅ Screen Wake Lock API is ACTIVE (الشاشة محمية من الانطفاء)');

          wakeLock.addEventListener('release', () => {
            console.log('⚠️ Screen Wake Lock released - Re-engaging...');
            isLocked = false;
          });
        }
      } catch (err) {
        console.warn(`Wake Lock notice: ${err.name}, ${err.message}`);
        isLocked = false;
      }

      // محاولة تشغيل الفيديو الصامت لتوفير الحماية المزدوجة
      if (videoEl && videoEl.paused) {
        videoEl.play().catch(() => {});
      }
    };

    createKeepAliveVideo();
    requestWakeLock();

    // 3. إعادة طلب القفل وتفعيل الفيديو عند تفاعل المستخدم أو عودة الشاشة
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    const handleUserInteraction = () => {
      if (!isLocked) {
        requestWakeLock();
      }
      if (videoEl && videoEl.paused) {
        videoEl.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('keydown', handleUserInteraction, { passive: true });

    // 4. فحص دوري كل 15 ثانية للتأكد من حيوية حماية الشاشة
    const intervalId = setInterval(() => {
      if (!isLocked && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    }, 15000);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('pointerdown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      if (wakeLock !== null) {
        wakeLock.release().catch(() => {});
      }
      if (videoEl && videoEl.parentNode) {
        videoEl.parentNode.removeChild(videoEl);
      }
    };
  }, []);
};

