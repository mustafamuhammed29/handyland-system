import { supabase } from './supabase';

// توليد معرف فريد 100% لكل نافذة وشاشة وتبويب لمنع أي تداخل بين الشاشات
const getDeviceId = (view) => {
  try {
    let tabId = sessionStorage.getItem('handyland_tab_uuid');
    if (!tabId) {
      tabId = `${view || 'screen'}_` + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem('handyland_tab_uuid', tabId);
    }
    return tabId;
  } catch (e) {
    return `${view || 'screen'}_` + Math.random().toString(36).substring(2, 9);
  }
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
let screensMap = new Map();
let currentPayload = null;
let isChannelSubscribed = false;

// إشعار جميع المراقبين في لوحة التحليلات
const notifyListeners = () => {
  const now = Date.now();
  const activeList = [];
  
  screensMap.forEach((scr, key) => {
    // نعتبر الشاشة متصلة إذا أرسلت نبضاً خلال آخر 35 ثانية
    if (now - (scr.lastActive || 0) < 35000) {
      activeList.push({ ...scr, sessionKey: key });
    }
  });

  listeners.forEach((fn) => {
    try {
      fn([...activeList]);
    } catch (e) {}
  });
};

export const screenPresence = {
  // تتبع وجود الشاشة الحالية وبث حالتها اللحظية إلى السيرفر
  trackScreen: async (currentView) => {
    try {
      const deviceId = getDeviceId(currentView);
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

      // إضافة الشاشة الحالية فوراً في الخريطة المحلية
      screensMap.set(deviceId, { ...currentPayload });
      notifyListeners();

      if (!presenceChannel) {
        presenceChannel = supabase.channel('online_screens_live_presence', {
          config: {
            presence: { key: deviceId },
            broadcast: { self: true },
          },
        });

        // 1. استقبال نبض البث المباشر الفوري من أي شاشة في المحل
        presenceChannel
          .on('broadcast', { event: 'screen_heartbeat' }, ({ payload }) => {
            if (payload && payload.id) {
              screensMap.set(payload.id, {
                ...payload,
                lastActive: Date.now(),
              });
              notifyListeners();
            }
          })
          // 2. الاستماع لإشارات الـ Ping من لوحة التحليلات للرد الفوري
          .on('broadcast', { event: 'ping_screens' }, async () => {
            if (currentPayload && presenceChannel && isChannelSubscribed) {
              currentPayload.lastActive = Date.now();
              try {
                await presenceChannel.send({
                  type: 'broadcast',
                  event: 'screen_heartbeat',
                  payload: currentPayload,
                });
                await presenceChannel.track(currentPayload);
              } catch (e) {}
            }
          })
          // 3. مزامنة حالة الـ Presence القياسية
          .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            Object.keys(state).forEach((key) => {
              const presences = state[key];
              if (Array.isArray(presences) && presences.length > 0) {
                presences.forEach((p) => {
                  if (p && p.id) {
                    screensMap.set(p.id, { ...p, lastActive: Date.now() });
                  }
                });
              }
            });
            notifyListeners();
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              isChannelSubscribed = true;
              if (currentPayload) {
                try {
                  await presenceChannel.track(currentPayload);
                  await presenceChannel.send({
                    type: 'broadcast',
                    event: 'screen_heartbeat',
                    payload: currentPayload,
                  });
                } catch (e) {}
              }
            }
          });

        // 4. نبض بث مباشر فوري كل 6 ثوانٍ لضمان وصول التحديث عبر WebSockets
        setInterval(async () => {
          if (presenceChannel && isChannelSubscribed && currentPayload) {
            currentPayload.lastActive = Date.now();
            screensMap.set(currentPayload.id, { ...currentPayload });
            try {
              await presenceChannel.send({
                type: 'broadcast',
                event: 'screen_heartbeat',
                payload: currentPayload,
              });
              await presenceChannel.track(currentPayload);
            } catch (e) {}
          }
          notifyListeners();
        }, 6000);
      } else {
        if (isChannelSubscribed && currentPayload) {
          try {
            await presenceChannel.track(currentPayload);
            await presenceChannel.send({
              type: 'broadcast',
              event: 'screen_heartbeat',
              payload: currentPayload,
            });
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Presence track notice:', e);
    }
  },

  // إرسال نداء حي لجميع الشاشات في المحل لتقوم بالرد وتأكيد الاتصال
  pingAllScreens: async () => {
    if (presenceChannel && isChannelSubscribed) {
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
    const now = Date.now();
    const activeList = [];
    screensMap.forEach((scr, key) => {
      if (now - (scr.lastActive || 0) < 35000) {
        activeList.push({ ...scr, sessionKey: key });
      }
    });
    callback(activeList);
    return () => listeners.delete(callback);
  },

  getLiveScreens: () => {
    const now = Date.now();
    const activeList = [];
    screensMap.forEach((scr, key) => {
      if (now - (scr.lastActive || 0) < 35000) {
        activeList.push({ ...scr, sessionKey: key });
      }
    });
    return activeList;
  },
};
