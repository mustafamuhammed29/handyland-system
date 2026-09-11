import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Tag, Wrench, Utensils, Coffee, Percent, Flame, Sparkles, Scissors } from 'lucide-react';
import { translations } from './constants/translations';
import { 
  DEFAULT_TICKER, DEFAULT_SUBTITLE, DEFAULT_PIN, 
  DEFAULT_CITY, DEFAULT_TICKER_SPEED, DEFAULT_FONT_SIZE,
  ALSAFI_DEFAULT_TICKER, ALSAFI_DEFAULT_SUBTITLE,
  KANKA_DEFAULT_TICKER, KANKA_DEFAULT_SUBTITLE, KANKA_DEFAULT_PIN,
  HSP_DEFAULT_TICKER, HSP_DEFAULT_SUBTITLE, HSP_DEFAULT_PIN
} from './constants/defaults';
import { supabase } from './services/supabase';
import { offlineCache, hydrateCacheFromIndexedDB } from './services/offlineCache';

import { MainMenu } from './components/screens/MainMenu';
import { ImageSlideshowScreen } from './components/screens/ImageSlideshowScreen';
import { AdminGateway } from './components/admin/AdminGateway';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminPanelAlsafi } from './components/admin/AdminPanelAlsafi';
import { AdminPanelKanka } from './components/admin/AdminPanelKanka';
import { AdminPanelHsp } from './components/admin/AdminPanelHsp';
import { SystemAnalyticsDashboard } from './components/admin/SystemAnalyticsDashboard';
import { StoreStatusScreen } from './components/screens/StoreStatusScreen';
import { AutoMemoryRefresh } from './components/common/AutoMemoryRefresh';
import { PinProtectionModal } from './components/common/PinProtectionModal';
import { MascotRobot } from './components/common/MascotRobot';
import { useWakeLock } from './hooks/useWakeLock';
import { screenPresence } from './services/screenPresence';

export default function App() {
  useWakeLock();
  const [initialLoadTime] = useState(Date.now());
  const getInitialView = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const screenParam = urlParams.get('screen');
    const validViews = [
      'screen1', 'screen2', 'screen3', 
      'alsafi-screen1', 'alsafi-screen2', 'alsafi-screen3', 
      'kanka-screen1', 'kanka-screen2', 'kanka-screen3', 
      'hsp-screen1',
      'admin-gateway', 'admin-handyland', 'admin-alsafi', 'admin-kanka', 'admin-hsp',
      'admin-analytics', 'analytics', 'menu'
    ];
    
    if (screenParam && validViews.includes(screenParam)) {
      return screenParam;
    }

    const hash = window.location.hash.replace('#', '');
    if (validViews.includes(hash)) {
      return hash;
    }

    const savedScreen = localStorage.getItem('handyland_active_screen');
    if (savedScreen && validViews.includes(savedScreen)) {
      return savedScreen;
    }

    return 'menu';
  };

  const [view, setView] = useState(getInitialView);
  const [lang, setLang] = useState(() => localStorage.getItem('handyland_lang') || 'de');
  const [showPinModal, setShowPinModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    screenPresence.trackScreen(view);
  }, [view]);

  const [devices, setDevices] = useState(() => offlineCache.getDevices());
  const [repairs, setRepairs] = useState(() => offlineCache.getRepairs());
  const [offers, setOffers] = useState(() => offlineCache.getOffers());

  const [alsafiMenu, setAlsafiMenu] = useState(() => offlineCache.getAlsafiMenu());
  const [alsafiDrinks, setAlsafiDrinks] = useState(() => offlineCache.getAlsafiDrinks());
  const [alsafiOffers, setAlsafiOffers] = useState(() => offlineCache.getAlsafiOffers());

  // Handyland Settings
  const [customLogo, setCustomLogo] = useState(null);
  const [customFavicon, setCustomFavicon] = useState(null);
  const [showClock, setShowClock] = useState(() => offlineCache.getSettings()?.showClock !== false);
  const [tickerText, setTickerText] = useState(DEFAULT_TICKER);
  const [tickerSpeed, setTickerSpeed] = useState(DEFAULT_TICKER_SPEED);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [headerSubtitle, setHeaderSubtitle] = useState(DEFAULT_SUBTITLE);
  const [intervalScreen1, setIntervalScreen1] = useState(6);
  const [intervalScreen2, setIntervalScreen2] = useState(6);
  const [intervalScreen3, setIntervalScreen3] = useState(6);
  const [adminPin, setAdminPin] = useState(DEFAULT_PIN);
  const [cityName, setCityName] = useState(DEFAULT_CITY);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [storeStatusMode, setStoreStatusMode] = useState('active');
  const [statusTimerTarget, setStatusTimerTarget] = useState('');
  const [showMascotRobot, setShowMascotRobot] = useState(() => localStorage.getItem('handyland_mascot_visible') !== 'false');
  const [customMascotGreeting, setCustomMascotGreeting] = useState(() => localStorage.getItem('handyland_mascot_greeting') || '');
  const [customMascotFace, setCustomMascotFace] = useState(() => localStorage.getItem('handyland_mascot_face') || '');
  const [customMascotPhrases, setCustomMascotPhrases] = useState(() => {
    try {
      const saved = localStorage.getItem('handyland_mascot_phrases');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Alsafi Settings
  const [alsafiLogo, setAlsafiLogo] = useState(null);
  const [alsafiFavicon, setAlsafiFavicon] = useState(null);
  const [alsafiShowClock, setAlsafiShowClock] = useState(() => offlineCache.getAlsafiSettings()?.showClock !== false);
  const [alsafiTicker, setAlsafiTicker] = useState(ALSAFI_DEFAULT_TICKER);
  const [alsafiTickerSpeed, setAlsafiTickerSpeed] = useState(DEFAULT_TICKER_SPEED);
  const [alsafiFontSize, setAlsafiFontSize] = useState(DEFAULT_FONT_SIZE);
  const [alsafiSubtitle, setAlsafiSubtitle] = useState(ALSAFI_DEFAULT_SUBTITLE);
  const [alsafiInt1, setAlsafiInt1] = useState(6);
  const [alsafiInt2, setAlsafiInt2] = useState(6);
  const [alsafiInt3, setAlsafiInt3] = useState(6);
  const [alsafiPin, setAlsafiPin] = useState('0000');
  const [alsafiCity, setAlsafiCity] = useState(DEFAULT_CITY);
  const [alsafiMaint, setAlsafiMaint] = useState(false);
  const [alsafiMaintMsg, setAlsafiMaintMsg] = useState('');
  const [alsafiStatusMode, setAlsafiStatusMode] = useState('active');
  const [alsafiTimerTarget, setAlsafiTimerTarget] = useState('');
  const [alsafiTitle1, setAlsafiTitle1] = useState(() => offlineCache.getAlsafiSettings()?.titleScreen1 || '');
  const [alsafiTitle2, setAlsafiTitle2] = useState(() => offlineCache.getAlsafiSettings()?.titleScreen2 || '');
  const [alsafiTitle3, setAlsafiTitle3] = useState(() => offlineCache.getAlsafiSettings()?.titleScreen3 || '');

  // Kanka Orient Deluxe Settings & Data
  const [kankaScreen1, setKankaScreen1] = useState(() => offlineCache.getKankaScreen1());
  const [kankaScreen2, setKankaScreen2] = useState(() => offlineCache.getKankaScreen2());
  const [kankaScreen3, setKankaScreen3] = useState(() => offlineCache.getKankaScreen3());
  const [kankaLogo, setKankaLogo] = useState(null);
  const [kankaFavicon, setKankaFavicon] = useState(null);
  const [kankaShowClock, setKankaShowClock] = useState(() => offlineCache.getKankaSettings()?.showClock !== false);
  const [kankaTicker, setKankaTicker] = useState(KANKA_DEFAULT_TICKER);
  const [kankaTickerSpeed, setKankaTickerSpeed] = useState(DEFAULT_TICKER_SPEED);
  const [kankaFontSize, setKankaFontSize] = useState(DEFAULT_FONT_SIZE);
  const [kankaSmokeIntensity, setKankaSmokeIntensity] = useState(() => {
    try {
      const saved = localStorage.getItem('kanka_smoke_intensity');
      return saved !== null && !isNaN(parseInt(saved, 10)) ? parseInt(saved, 10) : 50;
    } catch (e) {
      return 50;
    }
  });
  const [kankaSubtitle, setKankaSubtitle] = useState(KANKA_DEFAULT_SUBTITLE);
  const [kankaInt1, setKankaInt1] = useState(6);
  const [kankaInt2, setKankaInt2] = useState(6);
  const [kankaInt3, setKankaInt3] = useState(6);
  const [kankaPin, setKankaPin] = useState(KANKA_DEFAULT_PIN);
  const [kankaCity, setKankaCity] = useState(DEFAULT_CITY);
  const [kankaMaint, setKankaMaint] = useState(false);
  const [kankaMaintMsg, setKankaMaintMsg] = useState('');
  const [kankaStatusMode, setKankaStatusMode] = useState('active');
  const [kankaTimerTarget, setKankaTimerTarget] = useState('');
  const [kankaTitle1, setKankaTitle1] = useState(() => offlineCache.getKankaSettings()?.titleScreen1 || '');
  const [kankaTitle2, setKankaTitle2] = useState(() => offlineCache.getKankaSettings()?.titleScreen2 || '');
  const [kankaTitle3, setKankaTitle3] = useState(() => offlineCache.getKankaSettings()?.titleScreen3 || '');

  // HSP Hair & Beauty Settings & Data
  const [hspScreen1, setHspScreen1] = useState(() => offlineCache.getHspScreen1());
  const [hspLogo, setHspLogo] = useState(null);
  const [hspFavicon, setHspFavicon] = useState(null);
  const [hspShowClock, setHspShowClock] = useState(() => offlineCache.getHspSettings()?.showClock !== false);
  const [hspTicker, setHspTicker] = useState(HSP_DEFAULT_TICKER);
  const [hspTickerSpeed, setHspTickerSpeed] = useState(DEFAULT_TICKER_SPEED);
  const [hspFontSize, setHspFontSize] = useState(DEFAULT_FONT_SIZE);
  const [hspSubtitle, setHspSubtitle] = useState(HSP_DEFAULT_SUBTITLE);
  const [hspInt1, setHspInt1] = useState(6);
  const [hspPin, setHspPin] = useState(HSP_DEFAULT_PIN);
  const [hspCity, setHspCity] = useState(DEFAULT_CITY);
  const [hspMaint, setHspMaint] = useState(false);
  const [hspMaintMsg, setHspMaintMsg] = useState('');
  const [hspStatusMode, setHspStatusMode] = useState('active');
  const [hspTimerTarget, setHspTimerTarget] = useState('');
  const [hspTitle1, setHspTitle1] = useState(() => offlineCache.getHspSettings()?.titleScreen1 || '');

  // Pin Protection State (Tracks which branch they are trying to access)
  const [pendingAdminBranch, setPendingAdminBranch] = useState(null);

  const t = translations[lang] || translations.de;

  const navigateTo = (newView) => {
    window.history.pushState({ view: newView }, '', '#' + newView);
    localStorage.setItem('handyland_active_screen', newView);
    setView(newView);
  };

  const navigateBack = () => {
    navigateTo('menu');
  };

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('handyland_lang', newLang);
  };

  const updateFavicon = (faviconBase64) => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    if (faviconBase64) {
      link.href = faviconBase64;
    } else {
      link.href = '/favicon.svg'; // Default
    }
  };

  // دوال جلب البيانات المستهدفة بدقة (Targeted Fetching) لتوفير الباندويث بنسبة 95%
  const fetchShopDevices = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('shop_devices').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setDevices(data);
        offlineCache.saveDevices(data);
      }
    } catch (e) {
      console.warn("Fetch shop_devices notice:", e);
    }
  }, []);

  const fetchShopRepairs = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('shop_repairs').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setRepairs(data);
        offlineCache.saveRepairs(data);
      }
    } catch (e) {
      console.warn("Fetch shop_repairs notice:", e);
    }
  }, []);

  const fetchShopOffers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('shop_offers').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setOffers(data);
        offlineCache.saveOffers(data);
      }
    } catch (e) {
      console.warn("Fetch shop_offers notice:", e);
    }
  }, []);

  const hardReloadScreen = useCallback(() => {
    try {
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      }
    } catch (e) {}

    const currentUrl = window.location.href;
    const hash = window.location.hash || '';
    const urlWithoutHash = currentUrl.replace(hash, '');
    const cleanUrl = urlWithoutHash.split('&_t=')[0].split('?_t=')[0];
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const newUrl = `${cleanUrl}${separator}_t=${Date.now()}${hash}`;

    window.location.replace(newUrl);
  }, []);

  const fetchShopSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('shop_settings').select('*').eq('id', 'config').single();
      if (!error && data) {
        offlineCache.saveSettings(data);
        setCustomLogo(data.logoData || null);
        setCustomFavicon(data.faviconData || null);
        if (['screen1', 'screen2', 'screen3', 'menu'].includes(view) || view.startsWith('admin')) updateFavicon(data.faviconData);
        setTickerText(data.tickerText || DEFAULT_TICKER);
        setTickerSpeed(data.tickerSpeed || DEFAULT_TICKER_SPEED);
        setFontSize(data.fontSize || DEFAULT_FONT_SIZE);
        setHeaderSubtitle(data.headerSubtitle || DEFAULT_SUBTITLE);
        setIntervalScreen1(data.intervalScreen1 || 6);
        setIntervalScreen2(data.intervalScreen2 || 6);
        setIntervalScreen3(data.intervalScreen3 || 6);
        setAdminPin(data.adminPin || DEFAULT_PIN);
        setCityName(data.cityName || DEFAULT_CITY);
        if (data.showClock !== undefined) setShowClock(data.showClock !== false);
        setMaintenanceMode(data.maintenanceMode || false);
        setMaintenanceMessage(data.maintenanceMessage || '');
        setStoreStatusMode(data.storeStatusMode || 'active');
        setStatusTimerTarget(data.statusTimerTarget || '');
        if (data.showMascotRobot !== undefined) setShowMascotRobot(data.showMascotRobot);
        if (data.customMascotGreeting !== undefined) setCustomMascotGreeting(data.customMascotGreeting);
        if (data.customMascotFace !== undefined) setCustomMascotFace(data.customMascotFace || '');
        if (data.customMascotPhrases && Array.isArray(data.customMascotPhrases) && data.customMascotPhrases.length > 0) {
          setCustomMascotPhrases(data.customMascotPhrases);
          localStorage.setItem('handyland_mascot_phrases', JSON.stringify(data.customMascotPhrases));
        } else {
          const savedLocal = localStorage.getItem('handyland_mascot_phrases');
          if (savedLocal) {
            try { setCustomMascotPhrases(JSON.parse(savedLocal)); } catch(e) {}
          }
        }
        
        if (data.forceReload && data.forceReload > initialLoadTime && !view.startsWith('admin')) {
          hardReloadScreen();
        }
      }
    } catch (e) {
      console.warn("Fetch shop_settings notice:", e);
    }
  }, [view, initialLoadTime, hardReloadScreen]);

  const fetchAlsafiMenu = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('alsafi_menu').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setAlsafiMenu(data);
        offlineCache.saveAlsafiMenu(data);
      }
    } catch (e) {
      console.warn("Fetch alsafi_menu notice:", e);
    }
  }, []);

  const fetchAlsafiDrinks = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('alsafi_drinks').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setAlsafiDrinks(data);
        offlineCache.saveAlsafiDrinks(data);
      }
    } catch (e) {
      console.warn("Fetch alsafi_drinks notice:", e);
    }
  }, []);

  const fetchAlsafiOffers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('alsafi_offers').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setAlsafiOffers(data);
        offlineCache.saveAlsafiOffers(data);
      }
    } catch (e) {
      console.warn("Fetch alsafi_offers notice:", e);
    }
  }, []);

  const fetchAlsafiSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('alsafi_settings').select('*').eq('id', 'config').single();
      if (!error && data) {
        offlineCache.saveAlsafiSettings(data);
        setAlsafiLogo(data.logoData || null);
        setAlsafiFavicon(data.faviconData || null);
        if (view.startsWith('alsafi')) updateFavicon(data.faviconData);
        setAlsafiTicker(data.tickerText || ALSAFI_DEFAULT_TICKER);
        setAlsafiTickerSpeed(data.tickerSpeed || DEFAULT_TICKER_SPEED);
        setAlsafiFontSize(data.fontSize || DEFAULT_FONT_SIZE);
        setAlsafiSubtitle(data.headerSubtitle || ALSAFI_DEFAULT_SUBTITLE);
        setAlsafiInt1(data.intervalScreen1 || 6);
        setAlsafiInt2(data.intervalScreen2 || 6);
        setAlsafiInt3(data.intervalScreen3 || 6);
        setAlsafiPin(data.adminPin || '0000');
        setAlsafiCity(data.cityName || DEFAULT_CITY);
        if (data.showClock !== undefined) setAlsafiShowClock(data.showClock !== false);
        setAlsafiMaint(data.maintenanceMode || false);
        setAlsafiMaintMsg(data.maintenanceMessage || '');
        setAlsafiStatusMode(data.storeStatusMode || 'active');
        setAlsafiTimerTarget(data.statusTimerTarget || '');
        setAlsafiTitle1(data.titleScreen1 || '');
        setAlsafiTitle2(data.titleScreen2 || '');
        setAlsafiTitle3(data.titleScreen3 || '');

        if (data.forceReload && data.forceReload > initialLoadTime && !view.startsWith('admin')) {
          hardReloadScreen();
        }
      }
    } catch (e) {
      console.warn("Fetch alsafi_settings notice:", e);
    }
  }, [view, initialLoadTime, hardReloadScreen]);

  const fetchKankaScreen1 = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('kanka_screen1').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setKankaScreen1(data);
        offlineCache.saveKankaScreen1(data);
      }
    } catch (e) {
      console.warn("Fetch kanka_screen1 notice:", e);
    }
  }, []);

  const fetchKankaScreen2 = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('kanka_screen2').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setKankaScreen2(data);
        offlineCache.saveKankaScreen2(data);
      }
    } catch (e) {
      console.warn("Fetch kanka_screen2 notice:", e);
    }
  }, []);

  const fetchKankaScreen3 = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('kanka_screen3').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setKankaScreen3(data);
        offlineCache.saveKankaScreen3(data);
      }
    } catch (e) {
      console.warn("Fetch kanka_screen3 notice:", e);
    }
  }, []);

  const fetchKankaSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('kanka_settings').select('*').eq('id', 'config').single();
      if (!error && data) {
        offlineCache.saveKankaSettings(data);
        setKankaLogo(data.logoData || null);
        setKankaFavicon(data.faviconData || null);
        if (view.startsWith('kanka')) updateFavicon(data.faviconData);
        setKankaTicker(data.tickerText || KANKA_DEFAULT_TICKER);
        setKankaTickerSpeed(data.tickerSpeed || DEFAULT_TICKER_SPEED);
        setKankaFontSize(data.fontSize || DEFAULT_FONT_SIZE);
        if (data.fontSize && typeof data.fontSize === 'string' && data.fontSize.startsWith('smoke_')) {
          const parsedSmoke = parseInt(data.fontSize.replace('smoke_', ''), 10);
          if (!isNaN(parsedSmoke)) {
            setKankaSmokeIntensity(parsedSmoke);
            try { localStorage.setItem('kanka_smoke_intensity', String(parsedSmoke)); } catch (e) {}
          }
        } else if (data.smokeIntensity !== undefined && !isNaN(parseInt(data.smokeIntensity, 10))) {
          const parsedSmoke = parseInt(data.smokeIntensity, 10);
          setKankaSmokeIntensity(parsedSmoke);
          try { localStorage.setItem('kanka_smoke_intensity', String(parsedSmoke)); } catch (e) {}
        }
        setKankaSubtitle(data.headerSubtitle || KANKA_DEFAULT_SUBTITLE);
        setKankaInt1(data.intervalScreen1 || 6);
        setKankaInt2(data.intervalScreen2 || 6);
        setKankaInt3(data.intervalScreen3 || 6);
        setKankaPin(data.adminPin || KANKA_DEFAULT_PIN);
        setKankaCity(data.cityName || DEFAULT_CITY);
        if (data.showClock !== undefined) setKankaShowClock(data.showClock !== false);
        setKankaMaint(data.maintenanceMode || false);
        setKankaMaintMsg(data.maintenanceMessage || '');
        setKankaStatusMode(data.storeStatusMode || 'active');
        setKankaTimerTarget(data.statusTimerTarget || '');
        setKankaTitle1(data.titleScreen1 || '');
        setKankaTitle2(data.titleScreen2 || '');
        setKankaTitle3(data.titleScreen3 || '');

        if (data.forceReload && data.forceReload > initialLoadTime && !view.startsWith('admin')) {
          hardReloadScreen();
        }
      }
    } catch (e) {
      console.warn("Fetch kanka_settings notice:", e);
    }
  }, [view, initialLoadTime, hardReloadScreen]);

  const fetchHspScreen1 = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('hsp_screen1').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setHspScreen1(data);
        offlineCache.saveHspScreen1(data);
      }
    } catch (e) {
      console.warn("Fetch hsp_screen1 notice:", e);
    }
  }, []);

  const fetchHspSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('hsp_settings').select('*').eq('id', 'config').single();
      if (!error && data) {
        offlineCache.saveHspSettings(data);
        setHspLogo(data.logoData || null);
        setHspFavicon(data.faviconData || null);
        if (view.startsWith('hsp')) updateFavicon(data.faviconData);
        setHspTicker(data.tickerText || HSP_DEFAULT_TICKER);
        setHspTickerSpeed(data.tickerSpeed || DEFAULT_TICKER_SPEED);
        setHspFontSize(data.fontSize || DEFAULT_FONT_SIZE);
        setHspSubtitle(data.headerSubtitle || HSP_DEFAULT_SUBTITLE);
        setHspInt1(data.intervalScreen1 || 6);
        setHspPin(data.adminPin || HSP_DEFAULT_PIN);
        setHspCity(data.cityName || DEFAULT_CITY);
        if (data.showClock !== undefined) setHspShowClock(data.showClock !== false);
        setHspMaint(data.maintenanceMode || false);
        setHspMaintMsg(data.maintenanceMessage || '');
        setHspStatusMode(data.storeStatusMode || 'active');
        setHspTimerTarget(data.statusTimerTarget || '');
        setHspTitle1(data.titleScreen1 || '');

        if (data.forceReload && data.forceReload > initialLoadTime && !view.startsWith('admin')) {
          hardReloadScreen();
        }
      }
    } catch (e) {
      console.warn("Fetch hsp_settings notice:", e);
    }
  }, [view, initialLoadTime, hardReloadScreen]);

  // جلب البيانات بالكامل بشكل متسلسل وذكي
  const fetchAllData = useCallback(async () => {
    try {
      await Promise.allSettled([
        fetchShopSettings(),
        fetchAlsafiSettings(),
        fetchKankaSettings(),
        fetchHspSettings(),
        fetchShopDevices(),
        fetchShopRepairs(),
        fetchShopOffers(),
        fetchAlsafiMenu(),
        fetchAlsafiDrinks(),
        fetchAlsafiOffers(),
        fetchKankaScreen1(),
        fetchKankaScreen2(),
        fetchKankaScreen3(),
        fetchHspScreen1(),
      ]);
      setIsOffline(false);
    } catch (err) {
      console.warn("Error in fetchAllData:", err);
      setIsOffline(true);
      const cachedSettings = offlineCache.getSettings();
      if (cachedSettings) {
        if (cachedSettings.logoData) setCustomLogo(cachedSettings.logoData);
        if (cachedSettings.tickerText) setTickerText(cachedSettings.tickerText);
        if (cachedSettings.tickerSpeed) setTickerSpeed(cachedSettings.tickerSpeed);
        if (cachedSettings.fontSize) setFontSize(cachedSettings.fontSize);
        if (cachedSettings.headerSubtitle) setHeaderSubtitle(cachedSettings.headerSubtitle);
        if (cachedSettings.intervalScreen1) setIntervalScreen1(cachedSettings.intervalScreen1);
        if (cachedSettings.intervalScreen2) setIntervalScreen2(cachedSettings.intervalScreen2);
        if (cachedSettings.intervalScreen3) setIntervalScreen3(cachedSettings.intervalScreen3);
        if (cachedSettings.adminPin) setAdminPin(cachedSettings.adminPin);
        if (cachedSettings.cityName) setCityName(cachedSettings.cityName);
      }
      const alsCacheSet = offlineCache.getAlsafiSettings();
      if (alsCacheSet) {
        if (alsCacheSet.logoData) setAlsafiLogo(alsCacheSet.logoData);
        if (alsCacheSet.tickerText) setAlsafiTicker(alsCacheSet.tickerText);
        if (alsCacheSet.tickerSpeed) setAlsafiTickerSpeed(alsCacheSet.tickerSpeed);
        if (alsCacheSet.fontSize) setAlsafiFontSize(alsCacheSet.fontSize);
        if (alsCacheSet.headerSubtitle) setAlsafiSubtitle(alsCacheSet.headerSubtitle);
        if (alsCacheSet.intervalScreen1) setAlsafiInt1(alsCacheSet.intervalScreen1);
        if (alsCacheSet.intervalScreen2) setAlsafiInt2(alsCacheSet.intervalScreen2);
        if (alsCacheSet.intervalScreen3) setAlsafiInt3(alsCacheSet.intervalScreen3);
        if (alsCacheSet.adminPin) setAlsafiPin(alsCacheSet.adminPin);
        if (alsCacheSet.cityName) setAlsafiCity(alsCacheSet.cityName);
      }
      const kankaCacheSet = offlineCache.getKankaSettings();
      if (kankaCacheSet) {
        if (kankaCacheSet.logoData) setKankaLogo(kankaCacheSet.logoData);
        if (kankaCacheSet.tickerText) setKankaTicker(kankaCacheSet.tickerText);
        if (kankaCacheSet.tickerSpeed) setKankaTickerSpeed(kankaCacheSet.tickerSpeed);
        if (kankaCacheSet.fontSize) {
          setKankaFontSize(kankaCacheSet.fontSize);
          if (typeof kankaCacheSet.fontSize === 'string' && kankaCacheSet.fontSize.startsWith('smoke_')) {
            const pSmoke = parseInt(kankaCacheSet.fontSize.replace('smoke_', ''), 10);
            if (!isNaN(pSmoke)) setKankaSmokeIntensity(pSmoke);
          }
        }
        if (kankaCacheSet.smokeIntensity !== undefined && !isNaN(parseInt(kankaCacheSet.smokeIntensity, 10))) {
          setKankaSmokeIntensity(parseInt(kankaCacheSet.smokeIntensity, 10));
        }
        if (kankaCacheSet.headerSubtitle) setKankaSubtitle(kankaCacheSet.headerSubtitle);
        if (kankaCacheSet.intervalScreen1) setKankaInt1(kankaCacheSet.intervalScreen1);
        if (kankaCacheSet.intervalScreen2) setKankaInt2(kankaCacheSet.intervalScreen2);
        if (kankaCacheSet.intervalScreen3) setKankaInt3(kankaCacheSet.intervalScreen3);
        if (kankaCacheSet.adminPin) setKankaPin(kankaCacheSet.adminPin);
        if (kankaCacheSet.cityName) setKankaCity(kankaCacheSet.cityName);
      }
      const hspCacheSet = offlineCache.getHspSettings();
      if (hspCacheSet) {
        if (hspCacheSet.logoData) setHspLogo(hspCacheSet.logoData);
        if (hspCacheSet.tickerText) setHspTicker(hspCacheSet.tickerText);
        if (hspCacheSet.tickerSpeed) setHspTickerSpeed(hspCacheSet.tickerSpeed);
        if (hspCacheSet.fontSize) setHspFontSize(hspCacheSet.fontSize);
        if (hspCacheSet.headerSubtitle) setHspSubtitle(hspCacheSet.headerSubtitle);
        if (hspCacheSet.intervalScreen1) setHspInt1(hspCacheSet.intervalScreen1);
        if (hspCacheSet.adminPin) setHspPin(hspCacheSet.adminPin);
        if (hspCacheSet.cityName) setHspCity(hspCacheSet.cityName);
      }
    }
  }, [
    fetchShopSettings, fetchAlsafiSettings, fetchKankaSettings, fetchHspSettings,
    fetchShopDevices, fetchShopRepairs, fetchShopOffers,
    fetchAlsafiMenu, fetchAlsafiDrinks, fetchAlsafiOffers,
    fetchKankaScreen1, fetchKankaScreen2, fetchKankaScreen3,
    fetchHspScreen1
  ]);

  // استرجاع الذاكرة المحلية عند الإقلاع
  useEffect(() => {
    hydrateCacheFromIndexedDB().then(() => {
      const cachedDev = offlineCache.getDevices();
      if (cachedDev?.length) setDevices(cachedDev);
      const cachedRep = offlineCache.getRepairs();
      if (cachedRep?.length) setRepairs(cachedRep);
      const cachedOff = offlineCache.getOffers();
      if (cachedOff?.length) setOffers(cachedOff);

      const cachedMenu = offlineCache.getAlsafiMenu();
      if (cachedMenu?.length) setAlsafiMenu(cachedMenu);
      const cachedDrinks = offlineCache.getAlsafiDrinks();
      if (cachedDrinks?.length) setAlsafiDrinks(cachedDrinks);
      const cachedAlsOff = offlineCache.getAlsafiOffers();
      if (cachedAlsOff?.length) setAlsafiOffers(cachedAlsOff);

      const cachedKanka1 = offlineCache.getKankaScreen1();
      if (cachedKanka1?.length) setKankaScreen1(cachedKanka1);
      const cachedKanka2 = offlineCache.getKankaScreen2();
      if (cachedKanka2?.length) setKankaScreen2(cachedKanka2);
      const cachedKanka3 = offlineCache.getKankaScreen3();
      if (cachedKanka3?.length) setKankaScreen3(cachedKanka3);

      const cachedHsp1 = offlineCache.getHspScreen1();
      if (cachedHsp1?.length) setHspScreen1(cachedHsp1);
    });
  }, []);

  useEffect(() => {
    fetchAllData();

    const handleOnline = () => { setIsOffline(false); fetchAllData(); };
    const handleOffline = () => { setIsOffline(true); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handlePopState = (e) => {
      const savedView = e.state?.view || window.location.hash.replace('#', '') || 'menu';
      setView(savedView);
      localStorage.setItem('handyland_active_screen', savedView);
      setShowPinModal(false);
    };
    window.addEventListener('popstate', handlePopState);

    // اشتراك لحظي ذكي ومستهدف (Smart Granular Realtime)
    // عند تعديل أي جدول، يتم جلب ذلك الجدول فقط بدلاً من إعادة جلب كل شيء
    const channel = supabase
      .channel('public:handyland_tv_signage_v6')
      .on('broadcast', { event: 'FORCE_RELOAD_ALL_SCREENS' }, () => {
        if (!view.startsWith('admin')) {
          hardReloadScreen();
        }
      })
      .on('broadcast', { event: 'REMOTE_TRIGGER_FULLSCREEN' }, ({ payload }) => {
        if (!view.startsWith('admin')) {
          if (!payload?.targetView || payload.targetView === view) {
            try {
              const docEl = document.documentElement;
              if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
              else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen().catch(() => {});
              else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen().catch(() => {});
            } catch (e) {}
            window.dispatchEvent(new CustomEvent('tv_remote_fullscreen_requested'));
          }
        }
      })
      .on('broadcast', { event: 'MASCOT_UPDATED' }, ({ payload }) => {
        if (payload) {
          if (payload.showMascotRobot !== undefined) setShowMascotRobot(payload.showMascotRobot);
          if (payload.customMascotGreeting !== undefined) setCustomMascotGreeting(payload.customMascotGreeting);
          if (payload.customMascotFace !== undefined) setCustomMascotFace(payload.customMascotFace || '');
          if (payload.customMascotPhrases && Array.isArray(payload.customMascotPhrases)) {
            setCustomMascotPhrases(payload.customMascotPhrases);
            localStorage.setItem('handyland_mascot_phrases', JSON.stringify(payload.customMascotPhrases));
          }
        }
      })
      .on('broadcast', { event: 'KANKA_SMOKE_UPDATED' }, ({ payload }) => {
        if (payload && payload.smokeIntensity !== undefined) {
          const parsed = parseInt(payload.smokeIntensity, 10);
          if (!isNaN(parsed)) {
            setKankaSmokeIntensity(parsed);
            try { localStorage.setItem('kanka_smoke_intensity', String(parsed)); } catch (e) {}
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_devices' }, fetchShopDevices)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_repairs' }, fetchShopRepairs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_offers' }, fetchShopOffers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_settings' }, fetchShopSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_menu' }, fetchAlsafiMenu)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_drinks' }, fetchAlsafiDrinks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_offers' }, fetchAlsafiOffers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_settings' }, fetchAlsafiSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kanka_screen1' }, fetchKankaScreen1)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kanka_screen2' }, fetchKankaScreen2)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kanka_screen3' }, fetchKankaScreen3)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kanka_settings' }, fetchKankaSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hsp_screen1' }, fetchHspScreen1)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hsp_settings' }, fetchHspSettings)
      .subscribe();

    // فاحص نبض دوري كل 15 ثانية لشاشات التلفزيون لضمان استلام أمر التحديث حتى لو سكن المتصفح
    const tvPollerInterval = setInterval(() => {
      if (view.startsWith('admin')) return;
      const targetSettingsTable = view.startsWith('hsp')
        ? 'hsp_settings'
        : view.startsWith('kanka') 
          ? 'kanka_settings' 
          : view.startsWith('alsafi') 
            ? 'alsafi_settings' 
            : 'shop_settings';

      supabase.from(targetSettingsTable).select('forceReload').eq('id', 'config').single().then(({ data }) => {
        if (data?.forceReload && data.forceReload > initialLoadTime) {
          hardReloadScreen();
        }
      }).catch(() => {});
    }, 15000);

    return () => {
      clearInterval(tvPollerInterval);
      supabase.removeChannel(channel);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [
    view, initialLoadTime, hardReloadScreen,
    fetchAllData,
    fetchShopDevices, fetchShopRepairs, fetchShopOffers, fetchShopSettings,
    fetchAlsafiMenu, fetchAlsafiDrinks, fetchAlsafiOffers, fetchAlsafiSettings,
    fetchKankaScreen1, fetchKankaScreen2, fetchKankaScreen3, fetchKankaSettings,
    fetchHspScreen1, fetchHspSettings
  ]);

  const handleVerifyPin = (inputPin) => {
    let targetPin = adminPin || DEFAULT_PIN;
    if (pendingAdminBranch === 'alsafi') {
      targetPin = alsafiPin || '0000';
    } else if (pendingAdminBranch === 'kanka') {
      targetPin = kankaPin || KANKA_DEFAULT_PIN;
    } else if (pendingAdminBranch === 'hsp') {
      targetPin = hspPin || HSP_DEFAULT_PIN;
    }

    if (inputPin === targetPin) {
      setShowPinModal(false);
      if (pendingAdminBranch === 'analytics' || pendingAdminBranch === 'admin-analytics') {
        navigateTo('admin-analytics');
      } else if (pendingAdminBranch) {
        navigateTo(`admin-${pendingAdminBranch}`);
      } else {
        navigateTo('admin-gateway');
      }
      return true;
    }
    return false;
  };

  const initiateAdminLogin = (branch) => {
    setPendingAdminBranch(branch);
    setShowPinModal(true);
  };

  const renderActiveView = () => {
    if (view === 'admin-gateway') return (
      <AdminGateway onBranchSelect={initiateAdminLogin} onBack={navigateBack} lang={lang} />
    );

    if (view === 'admin-analytics' || view === 'analytics') return (
      <SystemAnalyticsDashboard onBack={() => navigateTo('admin-gateway')} lang={lang} />
    );

    if (view === 'admin-handyland') return (
      <AdminPanel 
        devices={devices} repairs={repairs} offers={offers} customLogo={customLogo} customFavicon={customFavicon}
        tickerText={tickerText} tickerSpeed={tickerSpeed} fontSize={fontSize} headerSubtitle={headerSubtitle} intervalScreen1={intervalScreen1} 
        intervalScreen2={intervalScreen2} intervalScreen3={intervalScreen3} adminPin={adminPin} cityName={cityName}
        showClock={showClock}
        onBack={() => navigateTo('admin-gateway')} onRefresh={fetchAllData} lang={lang} setLang={handleSetLang} t={t} 
        maintenanceMode={maintenanceMode} maintenanceMessage={maintenanceMessage}
        storeStatusMode={storeStatusMode} statusTimerTarget={statusTimerTarget}
        showMascotRobot={showMascotRobot} setShowMascotRobot={setShowMascotRobot}
        customMascotGreeting={customMascotGreeting} setCustomMascotGreeting={setCustomMascotGreeting}
        customMascotFace={customMascotFace} setCustomMascotFace={setCustomMascotFace}
        customMascotPhrases={customMascotPhrases} setCustomMascotPhrases={setCustomMascotPhrases}
      />
    );

    if (view === 'admin-alsafi') return (
      <AdminPanelAlsafi 
        devices={alsafiMenu} repairs={alsafiDrinks} offers={alsafiOffers} customLogo={alsafiLogo} customFavicon={alsafiFavicon}
        tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} fontSize={alsafiFontSize} headerSubtitle={alsafiSubtitle} intervalScreen1={alsafiInt1} 
        intervalScreen2={alsafiInt2} intervalScreen3={alsafiInt3} adminPin={alsafiPin} cityName={alsafiCity}
        titleScreen1={alsafiTitle1} titleScreen2={alsafiTitle2} titleScreen3={alsafiTitle3}
        showClock={alsafiShowClock}
        onBack={() => navigateTo('admin-gateway')} onRefresh={fetchAllData} lang={lang} setLang={handleSetLang} t={t} 
        maintenanceMode={alsafiMaint} maintenanceMessage={alsafiMaintMsg}
        storeStatusMode={alsafiStatusMode} statusTimerTarget={alsafiTimerTarget}
        showMascotRobot={showMascotRobot} setShowMascotRobot={setShowMascotRobot}
        customMascotGreeting={customMascotGreeting} setCustomMascotGreeting={setCustomMascotGreeting}
        customMascotFace={customMascotFace} setCustomMascotFace={setCustomMascotFace}
        customMascotPhrases={customMascotPhrases} setCustomMascotPhrases={setCustomMascotPhrases}
      />
    );

    if (view === 'admin-kanka') return (
      <AdminPanelKanka 
        screen1Items={kankaScreen1} screen2Items={kankaScreen2} screen3Items={kankaScreen3}
        customLogo={kankaLogo} customFavicon={kankaFavicon}
        tickerText={kankaTicker} tickerSpeed={kankaTickerSpeed} fontSize={kankaFontSize} headerSubtitle={kankaSubtitle}
        intervalScreen1={kankaInt1} intervalScreen2={kankaInt2} intervalScreen3={kankaInt3}
        adminPin={kankaPin} cityName={kankaCity}
        titleScreen1={kankaTitle1} titleScreen2={kankaTitle2} titleScreen3={kankaTitle3}
        showClock={kankaShowClock}
        smokeIntensity={kankaSmokeIntensity} setSmokeIntensity={setKankaSmokeIntensity}
        onBack={() => navigateTo('admin-gateway')} onRefresh={fetchAllData} lang={lang} setLang={handleSetLang} t={t} 
        maintenanceMessage={kankaMaintMsg} storeStatusMode={kankaStatusMode} statusTimerTarget={kankaTimerTarget}
        showMascotRobot={showMascotRobot} setShowMascotRobot={setShowMascotRobot}
        customMascotGreeting={customMascotGreeting} setCustomMascotGreeting={setCustomMascotGreeting}
        customMascotFace={customMascotFace} setCustomMascotFace={setCustomMascotFace}
        customMascotPhrases={customMascotPhrases} setCustomMascotPhrases={setCustomMascotPhrases}
      />
    );

    if (view === 'admin-hsp') return (
      <AdminPanelHsp 
        screen1Items={hspScreen1}
        customLogo={hspLogo} customFavicon={hspFavicon}
        tickerText={hspTicker} tickerSpeed={hspTickerSpeed} fontSize={hspFontSize} headerSubtitle={hspSubtitle}
        intervalScreen1={hspInt1}
        adminPin={hspPin} cityName={hspCity}
        titleScreen1={hspTitle1}
        showClock={hspShowClock}
        onBack={() => navigateTo('admin-gateway')} onRefresh={fetchAllData} lang={lang} setLang={handleSetLang} t={t} 
        maintenanceMessage={hspMaintMsg} storeStatusMode={hspStatusMode} statusTimerTarget={hspTimerTarget}
        showMascotRobot={showMascotRobot} setShowMascotRobot={setShowMascotRobot}
        customMascotGreeting={customMascotGreeting} setCustomMascotGreeting={setCustomMascotGreeting}
        customMascotFace={customMascotFace} setCustomMascotFace={setCustomMascotFace}
        customMascotPhrases={customMascotPhrases} setCustomMascotPhrases={setCustomMascotPhrases}
      />
    );

    const isHandylandView = ['screen1', 'screen2', 'screen3'].includes(view);
    const isAlsafiView = ['alsafi-screen1', 'alsafi-screen2', 'alsafi-screen3'].includes(view);
    const isKankaView = ['kanka-screen1', 'kanka-screen2', 'kanka-screen3'].includes(view);
    const isHspView = ['hsp-screen1'].includes(view);

    const activeStoreStatus = isHandylandView ? storeStatusMode : isAlsafiView ? alsafiStatusMode : isKankaView ? kankaStatusMode : hspStatusMode;
    const activeMaint = isHandylandView ? maintenanceMode : isAlsafiView ? alsafiMaint : isKankaView ? kankaMaint : hspMaint;
    const activeMaintMsg = isHandylandView ? maintenanceMessage : isAlsafiView ? alsafiMaintMsg : isKankaView ? kankaMaintMsg : hspMaintMsg;
    const activeTimer = isHandylandView ? statusTimerTarget : isAlsafiView ? alsafiTimerTarget : isKankaView ? kankaTimerTarget : hspTimerTarget;
    const activeLogo = isHandylandView ? customLogo : isAlsafiView ? alsafiLogo : isKankaView ? (kankaLogo || '/kanka-logo.jpg') : (hspLogo || '/hsp-logo.jpg');

    if (activeMaint || (activeStoreStatus && activeStoreStatus !== 'active')) return (
      <StoreStatusScreen 
        t={t} lang={lang} customLogo={activeLogo} 
        storeStatusMode={activeMaint && activeStoreStatus === 'active' ? 'maintenance' : activeStoreStatus}
        maintenanceMessage={activeMaintMsg} 
        statusTimerTarget={activeTimer}
      />
    );

    if (view === 'screen1') return (
      <ImageSlideshowScreen 
        items={devices} title="Top Angebote & Smartphones" icon={Smartphone} systemName="HANDYLAND"
        customLogo={customLogo || '/logo.png'} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen1} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={false}
        showHeader={showClock}
      />
    );

    if (view === 'screen2') return (
      <ImageSlideshowScreen 
        items={repairs} title="Reparaturzentrum & Preise" icon={Wrench} systemName="HANDYLAND"
        customLogo={customLogo || '/logo.png'} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen2} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={false}
        showHeader={showClock}
      />
    );

    if (view === 'screen3') return (
      <ImageSlideshowScreen 
        items={offers} title="Spezielle Angebote" icon={Tag} systemName="HANDYLAND" 
        customLogo={customLogo || '/logo.png'} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen3} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={true}
        showHeader={showClock}
      />
    );

    if (view === 'alsafi-screen1') return (
      <ImageSlideshowScreen 
        items={alsafiMenu} title={alsafiTitle1 || (lang === 'ar' ? 'المنيو الرئيسي' : 'Hauptmenü')} icon={Utensils} systemName="ALSAFI" 
        customLogo={alsafiLogo || '/logo.png'} tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} 
        headerSubtitle={alsafiSubtitle} slideInterval={alsafiInt1} cityName={alsafiCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={false}
        showHeader={alsafiShowClock}
      />
    );

    if (view === 'alsafi-screen2') return (
      <ImageSlideshowScreen 
        items={alsafiDrinks} title={alsafiTitle2 || (lang === 'ar' ? 'المشروبات' : 'Getränke')} icon={Coffee} systemName="ALSAFI" 
        customLogo={alsafiLogo || '/logo.png'} tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} 
        headerSubtitle={alsafiSubtitle} slideInterval={alsafiInt2} cityName={alsafiCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={false}
        showHeader={alsafiShowClock}
      />
    );

    if (view === 'alsafi-screen3') return (
      <ImageSlideshowScreen 
        items={alsafiOffers} title={alsafiTitle3 || (lang === 'ar' ? 'العروض المميزة' : 'Sonderangebote')} icon={Percent} systemName="ALSAFI" 
        customLogo={alsafiLogo || '/logo.png'} tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} 
        headerSubtitle={alsafiSubtitle} slideInterval={alsafiInt3} cityName={alsafiCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={true}
        showHeader={alsafiShowClock}
      />
    );

    if (view === 'kanka-screen1') return (
      <ImageSlideshowScreen 
        items={kankaScreen1} title={kankaTitle1 || (lang === 'ar' ? 'قائمة الشيشة والمعسل' : 'Shisha & Tabak Menü')} icon={Flame} systemName="KANKA" 
        customLogo={kankaLogo || '/kanka-logo.jpg'} tickerText={kankaTicker} tickerSpeed={kankaTickerSpeed} 
        headerSubtitle={kankaSubtitle} slideInterval={kankaInt1} cityName={kankaCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={false}
        showHeader={kankaShowClock}
        smokeIntensity={kankaSmokeIntensity}
      />
    );

    if (view === 'kanka-screen2') return (
      <ImageSlideshowScreen 
        items={kankaScreen2} title={kankaTitle2 || (lang === 'ar' ? 'المشروبات والكوكتيلات' : 'Getränke & Cocktails')} icon={Coffee} systemName="KANKA" 
        customLogo={kankaLogo || '/kanka-logo.jpg'} tickerText={kankaTicker} tickerSpeed={kankaTickerSpeed} 
        headerSubtitle={kankaSubtitle} slideInterval={kankaInt2} cityName={kankaCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={false}
        showHeader={kankaShowClock}
        smokeIntensity={kankaSmokeIntensity}
      />
    );

    if (view === 'kanka-screen3') return (
      <ImageSlideshowScreen 
        items={kankaScreen3} title={kankaTitle3 || (lang === 'ar' ? 'العروض وسهرات الويكند' : 'Sonderangebote & Events')} icon={Sparkles} systemName="KANKA" 
        customLogo={kankaLogo || '/kanka-logo.jpg'} tickerText={kankaTicker} tickerSpeed={kankaTickerSpeed} 
        headerSubtitle={kankaSubtitle} slideInterval={kankaInt3} cityName={kankaCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={true}
        showHeader={kankaShowClock}
        smokeIntensity={kankaSmokeIntensity}
      />
    );

    if (view === 'hsp-screen1') return (
      <ImageSlideshowScreen 
        items={hspScreen1} title={hspTitle1 || (lang === 'ar' ? 'عروض وتصفيف الشعر والتجميل' : 'HSP Hair & Beauty Styling')} icon={Scissors} systemName="HSP" 
        customLogo={hspLogo || '/hsp-logo.jpg'} tickerText={hspTicker} tickerSpeed={hspTickerSpeed} 
        headerSubtitle={hspSubtitle} slideInterval={hspInt1} cityName={hspCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={true}
        showHeader={hspShowClock}
      />
    );

    return (
      <MainMenu 
        navigateTo={navigateTo} customLogo={customLogo} lang={lang} 
        setLang={handleSetLang} t={t}
        alsafiTitle1={alsafiTitle1} alsafiTitle2={alsafiTitle2} alsafiTitle3={alsafiTitle3}
        kankaTitle1={kankaTitle1} kankaTitle2={kankaTitle2} kankaTitle3={kankaTitle3}
        hspTitle1={hspTitle1}
      />
    );
  };

  return (
    <>
      <AutoMemoryRefresh />
      {renderActiveView()}
      {['screen1', 'screen2', 'screen3'].includes(view) && (
        <MascotRobot 
          lang={lang} 
          customGreeting={customMascotGreeting} 
          customMascotFace={customMascotFace}
          isVisible={showMascotRobot} 
        />
      )}
      {showPinModal && (
        <PinProtectionModal 
          onClose={() => setShowPinModal(false)}
          onVerify={handleVerifyPin}
          t={t}
          lang={lang}
        />
      )}
    </>
  );
}
