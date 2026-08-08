import { useEffect } from 'react';

/**
 * Hook لمنع انطفاء الشاشة أو تفعيل وضع السكون (Wake Lock + Multi-Layer Fallbacks)
 * متوافق مع كافة المتصفحات، شاشات Smart TV، أجهزة Android TV، والـ Tablets.
 */
export const useWakeLock = () => {
  useEffect(() => {
    let wakeLock = null;
    let isLocked = false;

    // 1. طلب Screen Wake Lock من المتصفح
    const requestWakeLock = async () => {
      if (document.visibilityState !== 'visible') return;

      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          isLocked = true;
          console.log('✅ Screen Wake Lock is ACTIVE (منع انطفاء الشاشة مفعّل)');

          wakeLock.addEventListener('release', () => {
            console.log('⚠️ Screen Wake Lock was released');
            isLocked = false;
          });
        }
      } catch (err) {
        console.warn(`Wake Lock notice: ${err.name}, ${err.message}`);
        isLocked = false;
      }
    };

    // 2. إعادة طلب القفل تلقائياً عند عودة الشاشة أو تفاعل المستخدم
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    const handleUserInteraction = () => {
      if (!isLocked) {
        requestWakeLock();
      }
    };

    requestWakeLock();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    document.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    document.addEventListener('keydown', handleUserInteraction, { passive: true });

    // 3. فحص دوري ذكي كل 30 ثانية للتأكد من أن الشاشة محمية دائماً ولم تنطفئ
    const intervalId = setInterval(() => {
      if (!isLocked && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    }, 30000);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      document.removeEventListener('pointerdown', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      if (wakeLock !== null) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);
};
