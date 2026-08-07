import { useEffect } from 'react';

export const useWakeLock = () => {
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Screen Wake Lock is active');
          wakeLock.addEventListener('release', () => {
            console.log('Screen Wake Lock was released');
          });
        }
      } catch (err) {
        console.error(`Wake Lock error: ${err.name}, ${err.message}`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock !== null) {
        wakeLock.release().catch(console.error);
      }
    };
  }, []);
};
