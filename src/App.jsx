import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Tag, Wrench, Utensils, Coffee, Percent } from 'lucide-react';
import { translations } from './constants/translations';
import { 
  DEFAULT_TICKER, DEFAULT_SUBTITLE, DEFAULT_PIN, 
  DEFAULT_CITY, DEFAULT_TICKER_SPEED, DEFAULT_FONT_SIZE,
  ALSAFI_DEFAULT_TICKER, ALSAFI_DEFAULT_SUBTITLE
} from './constants/defaults';
import { supabase } from './services/supabase';
import { offlineCache } from './services/offlineCache';

import { MainMenu } from './components/screens/MainMenu';
import { ImageSlideshowScreen } from './components/screens/ImageSlideshowScreen';
import { AdminGateway } from './components/admin/AdminGateway';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminPanelAlsafi } from './components/admin/AdminPanelAlsafi';
import { StoreStatusScreen } from './components/screens/StoreStatusScreen';
import { AutoMemoryRefresh } from './components/common/AutoMemoryRefresh';
import { PinProtectionModal } from './components/common/PinProtectionModal';

export default function App() {
  const [initialLoadTime] = useState(Date.now());
  const getInitialView = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const screenParam = urlParams.get('screen');
    const validViews = ['screen1', 'screen2', 'screen3', 'alsafi-screen1', 'alsafi-screen2', 'alsafi-screen3', 'admin-gateway', 'admin-handyland', 'admin-alsafi', 'menu'];
    
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

  const fetchAllData = useCallback(async () => {
    try {
      const { data: devData, error: devErr } = await supabase.from('shop_devices').select('*').order('created_at', { ascending: false });
      if (!devErr && devData) {
        setDevices(devData);
        offlineCache.saveDevices(devData);
      }

      const { data: repData, error: repErr } = await supabase.from('shop_repairs').select('*').order('created_at', { ascending: false });
      if (!repErr && repData) {
        setRepairs(repData);
        offlineCache.saveRepairs(repData);
      }

      const { data: offData, error: offErr } = await supabase.from('shop_offers').select('*').order('created_at', { ascending: false });
      if (!offErr && offData) {
        setOffers(offData);
        offlineCache.saveOffers(offData);
      }

      const { data: setErrData, error: setErr } = await supabase.from('shop_settings').select('*').eq('id', 'config').single();
      if (!setErr && setErrData) {
        offlineCache.saveSettings(setErrData);
        setCustomLogo(setErrData.logoData || null);
        setCustomFavicon(setErrData.faviconData || null);
        if (['screen1', 'screen2', 'screen3', 'menu'].includes(view) || view.startsWith('admin')) updateFavicon(setErrData.faviconData);
        setTickerText(setErrData.tickerText || DEFAULT_TICKER);
        setTickerSpeed(setErrData.tickerSpeed || DEFAULT_TICKER_SPEED);
        setFontSize(setErrData.fontSize || DEFAULT_FONT_SIZE);
        setHeaderSubtitle(setErrData.headerSubtitle || DEFAULT_SUBTITLE);
        setIntervalScreen1(setErrData.intervalScreen1 || 6);
        setIntervalScreen2(setErrData.intervalScreen2 || 6);
        setIntervalScreen3(setErrData.intervalScreen3 || 6);
        setAdminPin(setErrData.adminPin || DEFAULT_PIN);
        setCityName(setErrData.cityName || DEFAULT_CITY);
        setMaintenanceMode(setErrData.maintenanceMode || false);
        setMaintenanceMessage(setErrData.maintenanceMessage || '');
        setStoreStatusMode(setErrData.storeStatusMode || 'active');
        setStatusTimerTarget(setErrData.statusTimerTarget || '');
        
        if (setErrData.forceReload && setErrData.forceReload > initialLoadTime && !view.startsWith('alsafi')) {
          window.location.reload(true);
        }
      }

      // Fetch Alsafi Data
      const { data: alsMenu } = await supabase.from('alsafi_menu').select('*').order('created_at', { ascending: false });
      if (alsMenu) { setAlsafiMenu(alsMenu); offlineCache.saveAlsafiMenu(alsMenu); }

      const { data: alsDrinks } = await supabase.from('alsafi_drinks').select('*').order('created_at', { ascending: false });
      if (alsDrinks) { setAlsafiDrinks(alsDrinks); offlineCache.saveAlsafiDrinks(alsDrinks); }

      const { data: alsOffers } = await supabase.from('alsafi_offers').select('*').order('created_at', { ascending: false });
      if (alsOffers) { setAlsafiOffers(alsOffers); offlineCache.saveAlsafiOffers(alsOffers); }

      const { data: alsSettings } = await supabase.from('alsafi_settings').select('*').eq('id', 'config').single();
      if (alsSettings) {
        offlineCache.saveAlsafiSettings(alsSettings);
        setAlsafiLogo(alsSettings.logoData || null);
        setAlsafiFavicon(alsSettings.faviconData || null);
        if (view.startsWith('alsafi')) updateFavicon(alsSettings.faviconData);
        setAlsafiTicker(alsSettings.tickerText || ALSAFI_DEFAULT_TICKER);
        setAlsafiTickerSpeed(alsSettings.tickerSpeed || DEFAULT_TICKER_SPEED);
        setAlsafiFontSize(alsSettings.fontSize || DEFAULT_FONT_SIZE);
        setAlsafiSubtitle(alsSettings.headerSubtitle || ALSAFI_DEFAULT_SUBTITLE);
        setAlsafiInt1(alsSettings.intervalScreen1 || 6);
        setAlsafiInt2(alsSettings.intervalScreen2 || 6);
        setAlsafiInt3(alsSettings.intervalScreen3 || 6);
        setAlsafiPin(alsSettings.adminPin || '0000');
        setAlsafiCity(alsSettings.cityName || DEFAULT_CITY);
        setAlsafiMaint(alsSettings.maintenanceMode || false);
        setAlsafiMaintMsg(alsSettings.maintenanceMessage || '');
        setAlsafiStatusMode(alsSettings.storeStatusMode || 'active');
        setAlsafiTimerTarget(alsSettings.statusTimerTarget || '');

        if (alsSettings.forceReload && alsSettings.forceReload > initialLoadTime && view.startsWith('alsafi')) {
          window.location.reload(true);
        }
      }

      setIsOffline(false);
    } catch (err) {
      console.warn("Supabase fetch notice (Offline mode active):", err);
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
  }, [initialLoadTime]);

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

    const channel = supabase
      .channel('public:handyland_tv_signage_v5')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_devices' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_repairs' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_offers' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_settings' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_menu' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_drinks' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_offers' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alsafi_settings' }, fetchAllData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchAllData]);

  const handleVerifyPin = (inputPin) => {
    const targetPin = pendingAdminBranch === 'alsafi' ? (alsafiPin || '0000') : (adminPin || DEFAULT_PIN);
    if (inputPin === targetPin) {
      setShowPinModal(false);
      if (pendingAdminBranch) {
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
      />
    );

    if (view === 'screen2') return (
      <ImageSlideshowScreen 
        items={repairs} title="Reparaturzentrum & Preise" icon={Wrench} systemName="HANDYLAND"
        customLogo={customLogo} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen2} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
      />
    );

    if (view === 'screen3') return (
      <ImageSlideshowScreen 
        items={offers} title="Spezielle Angebote" icon={Tag} systemName="HANDYLAND" 
        customLogo={customLogo} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen3} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
      />
    );

    if (view === 'alsafi-screen1') return (
      <ImageSlideshowScreen 
        items={alsafiMenu} title={lang === 'ar' ? 'المنيو الرئيسي' : 'Hauptmenü'} icon={Utensils} systemName="ALSAFI" 
        customLogo={alsafiLogo} tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} 
        headerSubtitle={alsafiSubtitle} slideInterval={alsafiInt1} cityName={alsafiCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
      />
    );

    if (view === 'alsafi-screen2') return (
      <ImageSlideshowScreen 
        items={alsafiDrinks} title={lang === 'ar' ? 'المشروبات' : 'Getränke'} icon={Coffee} systemName="ALSAFI" 
        customLogo={alsafiLogo} tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} 
        headerSubtitle={alsafiSubtitle} slideInterval={alsafiInt2} cityName={alsafiCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
      />
    );

    if (view === 'alsafi-screen3') return (
      <ImageSlideshowScreen 
        items={alsafiOffers} title={lang === 'ar' ? 'العروض المميزة' : 'Sonderangebote'} icon={Percent} systemName="ALSAFI" 
        customLogo={alsafiLogo} tickerText={alsafiTicker} tickerSpeed={alsafiTickerSpeed} 
        headerSubtitle={alsafiSubtitle} slideInterval={alsafiInt3} cityName={alsafiCity} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
      />
    );

    return (
      <MainMenu 
        navigateTo={navigateTo} customLogo={customLogo} lang={lang} 
        setLang={handleSetLang} t={t}
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
