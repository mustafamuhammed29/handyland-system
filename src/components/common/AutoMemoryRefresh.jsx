import { useEffect } from 'react';

/**
 * مكون مراقبة الذاكرة وإعادة التنشيط الفجري لشاشات التلفزيون التي تعمل 24/7
 * يقوم بإنعاش ذاكرة المتصفح تلقائياً في الساعة 4:00 صباحاً كل ليلة
 * أو بعد 24 ساعة تشغيل متواصل بدون إغلاق.
 */
export const AutoMemoryRefresh = () => {
  useEffect(() => {
    const startTime = Date.now();
    const reloadKey = 'handyland_last_auto_reload_date';

    const checkInterval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentDateStr = now.toDateString();
      const lastReloadDate = localStorage.getItem(reloadKey);

      // 1. إعادة تنشيط فجرية تلقائية في الساعة 4:00 صباحاً
      if (hours === 4 && (minutes === 0 || minutes === 1) && lastReloadDate !== currentDateStr) {
        console.log("🧹 4:00 AM Memory maintenance: Soft auto-refreshing TV screen...");
        localStorage.setItem(reloadKey, currentDateStr);
        window.location.reload();
        return;
      }

      // 2. إعادة تنشيط بعد 24 ساعة تشغيل مستمر (86,400,000 مللي ثانية)
      const uptimeMs = Date.now() - startTime;
      if (uptimeMs >= 86400000) {
        console.log("🧹 24 Hours Uptime Memory maintenance: Soft auto-refreshing TV screen...");
        localStorage.setItem(reloadKey, currentDateStr);
        window.location.reload();
      }
    }, 60000); // يفحص كل دقيقة واحدة

    return () => clearInterval(checkInterval);
  }, []);

  return null;
};
