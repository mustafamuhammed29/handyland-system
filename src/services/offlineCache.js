// خدمة التخزين الأوفلاين المحلية لحفظ بيانات البوسترات والأسعار والإعدادات
const CACHE_KEYS = {
  DEVICES: 'handyland_cache_devices',
  REPAIRS: 'handyland_cache_repairs',
  OFFERS: 'handyland_cache_offers',
  SETTINGS: 'handyland_cache_settings',
  ALSAFI_MENU: 'alsafi_cache_menu',
  ALSAFI_DRINKS: 'alsafi_cache_drinks',
  ALSAFI_OFFERS: 'alsafi_cache_offers',
  ALSAFI_SETTINGS: 'alsafi_cache_settings',
};

const safeSetItem = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Local storage cache quota notice for ${key}:`, e);
  }
};

export const offlineCache = {
  saveDevices: (data) => safeSetItem(CACHE_KEYS.DEVICES, data),
  getDevices: () => {
    try {
      const data = localStorage.getItem(CACHE_KEYS.DEVICES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveRepairs: (data) => safeSetItem(CACHE_KEYS.REPAIRS, data),
  getRepairs: () => {
    try {
      const data = localStorage.getItem(CACHE_KEYS.REPAIRS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveOffers: (data) => safeSetItem(CACHE_KEYS.OFFERS, data),
  getOffers: () => {
    try {
      const data = localStorage.getItem(CACHE_KEYS.OFFERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSettings: (data) => safeSetItem(CACHE_KEYS.SETTINGS, data),
  getSettings: () => {
    try {
      const data = localStorage.getItem(CACHE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveAlsafiMenu: (data) => safeSetItem(CACHE_KEYS.ALSAFI_MENU, data),
  getAlsafiMenu: () => {
    try { const data = localStorage.getItem(CACHE_KEYS.ALSAFI_MENU); return data ? JSON.parse(data) : []; }
    catch { return []; }
  },

  saveAlsafiDrinks: (data) => safeSetItem(CACHE_KEYS.ALSAFI_DRINKS, data),
  getAlsafiDrinks: () => {
    try { const data = localStorage.getItem(CACHE_KEYS.ALSAFI_DRINKS); return data ? JSON.parse(data) : []; }
    catch { return []; }
  },

  saveAlsafiOffers: (data) => safeSetItem(CACHE_KEYS.ALSAFI_OFFERS, data),
  getAlsafiOffers: () => {
    try { const data = localStorage.getItem(CACHE_KEYS.ALSAFI_OFFERS); return data ? JSON.parse(data) : []; }
    catch { return []; }
  },

  saveAlsafiSettings: (data) => safeSetItem(CACHE_KEYS.ALSAFI_SETTINGS, data),
  getAlsafiSettings: () => {
    try { const data = localStorage.getItem(CACHE_KEYS.ALSAFI_SETTINGS); return data ? JSON.parse(data) : null; }
    catch { return null; }
  }
};
