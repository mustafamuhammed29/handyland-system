import { supabase } from './supabase';

// توليد أو استرجاع معرف فريد لجهاز العرض / الشاشة
const getDeviceId = () => {
  const KEY = 'handyland_device_screen_uuid';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = 'screen_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(KEY, id);
  }
  return id;
};

const getScreenLabel = (view) => {
  switch (view) {
    case 'screen1': return 'شاشة 1 - عروض الهواتف (Handyland)';
    case 'screen2': return 'شاشة 2 - أسعار الصيانة (Handyland)';
    case 'screen3': return 'شاشة 3 - العروض المميزة (Handyland)';
    case 'alsafi-screen1': return 'شاشة 1 - المنيو الرئيسي (مطعم الصافي)';
    case 'alsafi-screen2': return 'شاشة 2 - المشروبات (مطعم الصافي)';
    case 'alsafi-screen3': return 'شاشة 3 - العروض (مطعم الصافي)';
    case 'admin-handyland': return 'لوحة تحكم هانديلاند';
    case 'admin-alsafi': return 'لوحة تحكم مطعم الصافي';
    case 'admin-gateway': return 'بوابة الإدارة المركزية';
    case 'admin-analytics':
    case 'analytics': return 'لوحة التحليلات والمراقبة';
    default: return 'القائمة الرئيسية (Main Menu)';
  }
};

const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast.tv|tizen|webos/i.test(ua)) {
    return 'Smart TV';
  }
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) {
    return 'Android TV / Box';
  }
  if (/Mobile|Android|iPhone/i.test(ua)) {
    return 'Smartphone / Tablet';
  }
  return 'Display Browser / PC';
};

let presenceChannel = null;
const listeners = new Set();
let currentLiveScreens = [];
let currentPayload = null;

export const screenPresence = {
  // تتبع وجود الشاشة الحالية وبث حالتها اللحظية إلى السيرفر
  trackScreen: async (currentView) => {
    try {
      const deviceId = getDeviceId();
      currentPayload = {
        id: deviceId,
        view: currentView,
        label: getScreenLabel(currentView),
        system: currentView.startsWith('alsafi') ? 'ALSAFI' : 'HANDYLAND',
        deviceType: getDeviceType(),
        resolution: `${window.innerWidth}x${window.innerHeight}`,
        onlineSince: currentPayload?.onlineSince || Date.now(),
        lastActive: Date.now(),
      };

      if (!presenceChannel) {
        presenceChannel = supabase.channel('online_screens_live_presence', {
          config: {
            presence: { key: deviceId },
            broadcast: { self: true },
          },
        });

        // 1. مزامنة حالة الشاشات عند الانضمام والتغيير
        presenceChannel
          .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            const flattened = [];
            Object.keys(state).forEach((key) => {
              const presences = state[key];
              if (Array.isArray(presences) && presences.length > 0) {
                // نأخذ آخر حالة نشطة
                const latest = presences[presences.length - 1];
                flattened.push({ ...latest, sessionKey: key });
              }
            });
            currentLiveScreens = flattened;
            listeners.forEach((fn) => fn([...currentLiveScreens]));
          })
          // 2. الاستماع لإشارات الـ Ping من لوحة التحليلات
          .on('broadcast', { event: 'ping_screens' }, async () => {
            if (currentPayload) {
              currentPayload.lastActive = Date.now();
              await presenceChannel.track(currentPayload);
            }
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await presenceChannel.track(currentPayload);
            }
          });

        // 3. نبض قلبي دوري كل 12 ثانية لتثبيت اتصال البث المباشر
        setInterval(async () => {
          if (presenceChannel && currentPayload) {
            currentPayload.lastActive = Date.now();
            try {
              await presenceChannel.track(currentPayload);
            } catch (e) {}
          }
        }, 12000);
      } else {
        await presenceChannel.track(currentPayload);
      }
    } catch (e) {
      console.warn('Presence track notice:', e);
    }
  },

  // إرسال نداء حي لجميع الشاشات في المحل لتقوم بالرد وتأكيد الاتصال
  pingAllScreens: async () => {
    if (presenceChannel) {
      try {
        await presenceChannel.send({
          type: 'broadcast',
          event: 'ping_screens',
          payload: { timestamp: Date.now() },
        });
      } catch (e) {}
    }
  },

  // الاشتراك في قائمة الشاشات المتصلة بالبث المباشر
  subscribeToLiveScreens: (callback) => {
    listeners.add(callback);
    callback([...currentLiveScreens]);
    return () => listeners.delete(callback);
  },

  getLiveScreens: () => [...currentLiveScreens],
};
