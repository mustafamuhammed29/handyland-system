import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Tag, Wrench, Utensils, Coffee, Percent } from 'lucide-react';
import { translations } from './constants/translations';
import { 
  DEFAULT_TICKER, DEFAULT_SUBTITLE, DEFAULT_PIN, 
  DEFAULT_CITY, DEFAULT_TICKER_SPEED, DEFAULT_FONT_SIZE,
  ALSAFI_DEFAULT_TICKER, ALSAFI_DEFAULT_SUBTITLE
} from './constants/defaults';
import { supabase } from './services/supabase';
import { offlineCache, hydrateCacheFromIndexedDB } from './services/offlineCache';

import { MainMenu } from './components/screens/MainMenu';
import { ImageSlideshowScreen } from './components/screens/ImageSlideshowScreen';
import { AdminGateway } from './components/admin/AdminGateway';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminPanelAlsafi } from './components/admin/AdminPanelAlsafi';
import { SystemAnalyticsDashboard } from './components/admin/SystemAnalyticsDashboard';
import { StoreStatusScreen } from './components/screens/StoreStatusScreen';
import { AutoMemoryRefresh } from './components/common/AutoMemoryRefresh';
import { PinProtectionModal } from './components/common/PinProtectionModal';
import { useWakeLock } from './hooks/useWakeLock';
import { screenPresence } from './services/screenPresence';

export default function App() {
  useWakeLock();
  const [initialLoadTime] = useState(Date.now());
  const getInitialView = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const screenParam = urlParams.get('screen');
    const validViews = ['screen1', 'screen2', 'screen3', 'alsafi-screen1', 'alsafi-screen2', 'alsafi-screen3', 'admin-gateway', 'admin-handyland', 'admin-alsafi', 'admin-analytics', 'analytics', 'menu'];
    
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

  // Alsafi Settings
  const [alsafiLogo, setAlsafiLogo] = useState(null);
  const [alsafiFavicon, setAlsafiFavicon] = useState(null);
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
        setMaintenanceMode(data.maintenanceMode || false);
        setMaintenanceMessage(data.maintenanceMessage || '');
        setStoreStatusMode(data.storeStatusMode || 'active');
        setStatusTimerTarget(data.statusTimerTarget || '');
        
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

  // جلب البيانات بالكامل بشكل متسلسل وذكي
  const fetchAllData = useCallback(async () => {
    try {
      await Promise.allSettled([
        fetchShopSettings(),
        fetchAlsafiSettings(),
        fetchShopDevices(),
        fetchShopRepairs(),
        fetchShopOffers(),
        fetchAlsafiMenu(),
        fetchAlsafiDrinks(),
        fetchAlsafiOffers(),
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
    }
  }, [
    fetchShopSettings, fetchAlsafiSettings,
    fetchShopDevices, fetchShopRepairs, fetchShopOffers,
    fetchAlsafiMenu, fetchAlsafiDrinks, fetchAlsafiOffers
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_devices' }, fetchShopDevices)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_repairs' }, fetchShopRepairs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_offers' }, fetchShopOffers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_settings' }, fetchShopSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_menu' }, fetchAlsafiMenu)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_drinks' }, fetchAlsafiDrinks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_offers' }, fetchAlsafiOffers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_settings' }, fetchAlsafiSettings)
      .subscribe();

    // فاحص نبض دوري كل 15 ثانية لشاشات التلفزيون لضمان استلام أمر التحديث حتى لو سكن المتصفح
    const tvPollerInterval = setInterval(() => {
      if (view.startsWith('admin')) return;
      supabase.from('shop_settings').select('forceReload').eq('id', 'config').single().then(({ data }) => {
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
    fetchAlsafiMenu, fetchAlsafiDrinks, fetchAlsafiOffers, fetchAlsafiSettings
  ]);

  const handleVerifyPin = (inputPin) => {
    const targetPin = pendingAdminBranch === 'alsafi' ? (alsafiPin || '0000') : (adminPin || DEFAULT_PIN);
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
        onBack={() => navigateTo('admin-gateway')} onRefresh={fetchAllData} lang={lang} setLang={handleSetLang} t={t} 
        maintenanceMode={maintenanceMode} maintenanceMessage={maintenanceMessage}
        storeStatusMode={storeStatusMode} statusTimerTarget={statusTimerTarget}
      />
    );

    if (view === 'admin-alsafi') return (
      <AdminPanelAlsafi 
        devices={alsafiMenu} repairs={alsafiDrinks} offers={alsafiOffers} customLogo={alsafiLogo} customFavicon={alsafiFavicon}
        tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} fontSize={alsafiFontSize} headerSubtitle={alsafiSubtitle} intervalScreen1={alsafiInt1} 
        intervalScreen2={alsafiInt2} intervalScreen3={alsafiInt3} adminPin={alsafiPin} cityName={alsafiCity}
        titleScreen1={alsafiTitle1} titleScreen2={alsafiTitle2} titleScreen3={alsafiTitle3}
        onBack={() => navigateTo('admin-gateway')} onRefresh={fetchAllData} lang={lang} setLang={handleSetLang} t={t} 
        maintenanceMode={alsafiMaint} maintenanceMessage={alsafiMaintMsg}
        storeStatusMode={alsafiStatusMode} statusTimerTarget={alsafiTimerTarget}
      />
    );

    const isHandylandView = ['screen1', 'screen2', 'screen3'].includes(view);
    const activeStoreStatus = isHandylandView ? storeStatusMode : alsafiStatusMode;
    const activeMaint = isHandylandView ? maintenanceMode : alsafiMaint;
    const activeMaintMsg = isHandylandView ? maintenanceMessage : alsafiMaintMsg;
    const activeTimer = isHandylandView ? statusTimerTarget : alsafiTimerTarget;
    const activeLogo = isHandylandView ? customLogo : alsafiLogo;

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
        customLogo={customLogo} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen1} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={false}
      />
    );

    if (view === 'screen2') return (
      <ImageSlideshowScreen 
        items={repairs} title="Reparaturzentrum & Preise" icon={Wrench} systemName="HANDYLAND"
        customLogo={customLogo} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen2} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={false}
      />
    );

    if (view === 'screen3') return (
      <ImageSlideshowScreen 
        items={offers} title="Spezielle Angebote" icon={Tag} systemName="HANDYLAND" 
        customLogo={customLogo} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen3} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={true}
      />
    );

    if (view === 'alsafi-screen1') return (
      <ImageSlideshowScreen 
        items={alsafiMenu} title={alsafiTitle1 || (lang === 'ar' ? 'المنيو الرئيسي' : 'Hauptmenü')} icon={Utensils} systemName="ALSAFI" 
        customLogo={alsafiLogo} tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} 
        headerSubtitle={alsafiSubtitle} slideInterval={alsafiInt1} cityName={alsafiCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={false}
      />
    );

    if (view === 'alsafi-screen2') return (
      <ImageSlideshowScreen 
        items={alsafiDrinks} title={alsafiTitle2 || (lang === 'ar' ? 'المشروبات' : 'Getränke')} icon={Coffee} systemName="ALSAFI" 
        customLogo={alsafiLogo} tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} 
        headerSubtitle={alsafiSubtitle} slideInterval={alsafiInt2} cityName={alsafiCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={false}
      />
    );

    if (view === 'alsafi-screen3') return (
      <ImageSlideshowScreen 
        items={alsafiOffers} title={alsafiTitle3 || (lang === 'ar' ? 'العروض المميزة' : 'Sonderangebote')} icon={Percent} systemName="ALSAFI" 
        customLogo={alsafiLogo} tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} 
        headerSubtitle={alsafiSubtitle} slideInterval={alsafiInt3} cityName={alsafiCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
        showNewsTicker={true}
      />
    );

    return (
      <MainMenu 
        navigateTo={navigateTo} customLogo={customLogo} lang={lang} 
        setLang={handleSetLang} t={t}
        alsafiTitle1={alsafiTitle1} alsafiTitle2={alsafiTitle2} alsafiTitle3={alsafiTitle3}
      />
    );
  };

  return (
    <>
      <AutoMemoryRefresh />
      {renderActiveView()}
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
