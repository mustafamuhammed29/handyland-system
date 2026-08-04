// خدمة التخزين الأوفلاين المحلية لحفظ بيانات البوسترات والأسعار والإعدادات
const CACHE_KEYS = {
  DEVICES: 'handyland_cache_devices',
  REPAIRS: 'handyland_cache_repairs',
  OFFERS: 'handyland_cache_offers',
  SETTINGS: 'handyland_cache_settings',
  REPAIR_PRICES: 'handyland_cache_repair_prices',
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

  saveRepairPrices: (data) => {
    try {
      localStorage.setItem(CACHE_KEYS.REPAIR_PRICES, JSON.stringify(data));
    } catch (e) {
      console.warn("Local storage cache quota notice:", e);
    }
  },
  getRepairPrices: () => {
    try {
      const data = localStorage.getItem(CACHE_KEYS.REPAIR_PRICES);
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
  }
};
