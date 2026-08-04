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

export const offlineCache = {
  saveDevices: (data) => {
    try {
      localStorage.setItem(CACHE_KEYS.DEVICES, JSON.stringify(data));
    } catch (e) {
      console.warn("Local storage cache quota notice:", e);
    }
  },
  getDevices: () => {
    try {
      const data = localStorage.getItem(CACHE_KEYS.DEVICES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveRepairs: (data) => {
    try {
      localStorage.setItem(CACHE_KEYS.REPAIRS, JSON.stringify(data));
    } catch (e) {
      console.warn("Local storage cache quota notice:", e);
    }
  },
  getRepairs: () => {
    try {
      const data = localStorage.getItem(CACHE_KEYS.REPAIRS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveOffers: (data) => {
    try {
      localStorage.setItem(CACHE_KEYS.OFFERS, JSON.stringify(data));
    } catch (e) {
      console.warn("Local storage cache quota notice:", e);
    }
  },
  getOffers: () => {
    try {
      const data = localStorage.getItem(CACHE_KEYS.OFFERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSettings: (data) => {
    try {
      localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(data));
    } catch (e) {
      console.warn("Local storage settings cache notice:", e);
    }
  },
  getSettings: () => {
    try {
      const data = localStorage.getItem(CACHE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveAlsafiMenu: (data) => {
    try { localStorage.setItem(CACHE_KEYS.ALSAFI_MENU, JSON.stringify(data)); }
    catch (e) { console.warn("Local storage cache quota notice:", e); }
  },
  getAlsafiMenu: () => {
    try { const data = localStorage.getItem(CACHE_KEYS.ALSAFI_MENU); return data ? JSON.parse(data) : []; }
    catch { return []; }
  },

  saveAlsafiDrinks: (data) => {
    try { localStorage.setItem(CACHE_KEYS.ALSAFI_DRINKS, JSON.stringify(data)); }
    catch (e) { console.warn("Local storage cache quota notice:", e); }
  },
  getAlsafiDrinks: () => {
    try { const data = localStorage.getItem(CACHE_KEYS.ALSAFI_DRINKS); return data ? JSON.parse(data) : []; }
    catch { return []; }
  },

  saveAlsafiOffers: (data) => {
    try { localStorage.setItem(CACHE_KEYS.ALSAFI_OFFERS, JSON.stringify(data)); }
    catch (e) { console.warn("Local storage cache quota notice:", e); }
  },
  getAlsafiOffers: () => {
    try { const data = localStorage.getItem(CACHE_KEYS.ALSAFI_OFFERS); return data ? JSON.parse(data) : []; }
    catch { return []; }
  },

  saveAlsafiSettings: (data) => {
    try { localStorage.setItem(CACHE_KEYS.ALSAFI_SETTINGS, JSON.stringify(data)); }
    catch (e) { console.warn("Local storage settings cache notice:", e); }
  },
  getAlsafiSettings: () => {
    try { const data = localStorage.getItem(CACHE_KEYS.ALSAFI_SETTINGS); return data ? JSON.parse(data) : null; }
    catch { return null; }
  }
};
