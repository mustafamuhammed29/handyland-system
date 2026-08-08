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

export const screenPresence = {
  // تتبع وجود الشاشة الحالية وبث حالتها اللحظية إلى السيرفر
  trackScreen: async (currentView) => {
    try {
      const deviceId = getDeviceId();
      const payload = {
        id: deviceId,
        view: currentView,
        label: getScreenLabel(currentView),
        system: currentView.startsWith('alsafi') ? 'ALSAFI' : 'HANDYLAND',
        deviceType: getDeviceType(),
        resolution: `${window.innerWidth}x${window.innerHeight}`,
        onlineSince: Date.now(),
        lastActive: Date.now(),
      };

      if (!presenceChannel) {
        presenceChannel = supabase.channel('online_screens_live_presence', {
          config: {
            presence: { key: deviceId },
          },
        });

        presenceChannel
          .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            const flattened = [];
            Object.keys(state).forEach((key) => {
              const presences = state[key];
              if (Array.isArray(presences) && presences[0]) {
                flattened.push({ ...presences[0], sessionKey: key });
              }
            });
            currentLiveScreens = flattened;
            listeners.forEach((fn) => fn([...currentLiveScreens]));
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await presenceChannel.track(payload);
            }
          });
      } else {
        await presenceChannel.track(payload);
      }
    } catch (e) {
      console.warn('Presence track notice:', e);
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
