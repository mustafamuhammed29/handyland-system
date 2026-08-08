// خدمة التخزين الذكية عالية السعة (IndexedDB + Memory Cache) لحفظ البوسترات والوسائط بدون حدود
const DB_NAME = 'handyland_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'signage_cache';

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

// ذاكرة وصول عشوائي محلية سريعة جداً (RAM Cache) للوصول المتزامن
const memoryCache = new Map();

// محاولة تحميل البيانات الخفيفة من localStorage كنسخة احتياطية سريعة
Object.values(CACHE_KEYS).forEach((key) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      memoryCache.set(key, JSON.parse(raw));
    }
  } catch (e) {
    // تجاهل أخطاء الحجم
  }
});

// فتح قاعدة بيانات IndexedDB
const openDatabase = () => {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (err) => {
      console.warn('IndexedDB Open warning:', err);
      resolve(null);
    };
  });
};

let dbPromise = null;
const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDatabase();
  }
  return dbPromise;
};

// حفظ البيانات في IndexedDB + Memory
const persistItem = async (key, data) => {
  memoryCache.set(key, data);

  // حفظ في localStorage إذا كانت البيانات صغيرة فقط (مثل الإعدادات)
  if (key.includes('settings')) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }

  // حفظ الوسائط والقوائم الكاملة في IndexedDB بلا حدود
  try {
    const db = await getDb();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(data, key);
  } catch (e) {
    console.warn(`IndexedDB save error for ${key}:`, e);
  }
};

// استرجاع البيانات من IndexedDB إلى Memory Cache عند بدء التشغيل
export const hydrateCacheFromIndexedDB = async () => {
  try {
    const db = await getDb();
    if (!db) return memoryCache;
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const keys = Object.values(CACHE_KEYS);
    await Promise.all(
      keys.map((key) => {
        return new Promise((resolve) => {
          const req = store.get(key);
          req.onsuccess = () => {
            if (req.result !== undefined && req.result !== null) {
              memoryCache.set(key, req.result);
            }
            resolve();
          };
          req.onerror = () => resolve();
        });
      })
    );
  } catch (e) {
    console.warn('Hydrate from IndexedDB notice:', e);
  }
  return memoryCache;
};

// بدء تشغيل الاسترجاع تلقائياً
hydrateCacheFromIndexedDB();

export const offlineCache = {
  saveDevices: (data) => persistItem(CACHE_KEYS.DEVICES, data),
  getDevices: () => memoryCache.get(CACHE_KEYS.DEVICES) || [],

  saveRepairs: (data) => persistItem(CACHE_KEYS.REPAIRS, data),
  getRepairs: () => memoryCache.get(CACHE_KEYS.REPAIRS) || [],

  saveOffers: (data) => persistItem(CACHE_KEYS.OFFERS, data),
  getOffers: () => memoryCache.get(CACHE_KEYS.OFFERS) || [],

  saveSettings: (data) => persistItem(CACHE_KEYS.SETTINGS, data),
  getSettings: () => memoryCache.get(CACHE_KEYS.SETTINGS) || null,

  saveAlsafiMenu: (data) => persistItem(CACHE_KEYS.ALSAFI_MENU, data),
  getAlsafiMenu: () => memoryCache.get(CACHE_KEYS.ALSAFI_MENU) || [],

  saveAlsafiDrinks: (data) => persistItem(CACHE_KEYS.ALSAFI_DRINKS, data),
  getAlsafiDrinks: () => memoryCache.get(CACHE_KEYS.ALSAFI_DRINKS) || [],

  saveAlsafiOffers: (data) => persistItem(CACHE_KEYS.ALSAFI_OFFERS, data),
  getAlsafiOffers: () => memoryCache.get(CACHE_KEYS.ALSAFI_OFFERS) || [],

  saveAlsafiSettings: (data) => persistItem(CACHE_KEYS.ALSAFI_SETTINGS, data),
  getAlsafiSettings: () => memoryCache.get(CACHE_KEYS.ALSAFI_SETTINGS) || null,
};
