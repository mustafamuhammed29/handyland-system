import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Tag, Wrench } from 'lucide-react';
import { translations } from './constants/translations';
import { 
  DEFAULT_TICKER, DEFAULT_SUBTITLE, DEFAULT_PIN, 
  DEFAULT_CITY, DEFAULT_TICKER_SPEED, DEFAULT_FONT_SIZE 
} from './constants/defaults';
import { supabase } from './services/supabase';
import { offlineCache } from './services/offlineCache';

import { MainMenu } from './components/screens/MainMenu';
import { ImageSlideshowScreen } from './components/screens/ImageSlideshowScreen';
import { AdminPanel } from './components/admin/AdminPanel';
import { StoreStatusScreen } from './components/screens/StoreStatusScreen';
import { AutoMemoryRefresh } from './components/common/AutoMemoryRefresh';

export default function App() {
  const [initialLoadTime] = useState(Date.now());
  const getInitialView = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const screenParam = urlParams.get('screen');
    if (screenParam) {
      if (screenParam === '1') return 'screen1';
      if (screenParam === '2') return 'screen2';
      if (screenParam === '3') return 'screen3';
      if (screenParam === 'admin') return 'admin';
    }

    const hash = window.location.hash.replace('#', '');
    if (['screen1', 'screen2', 'screen3', 'admin', 'menu'].includes(hash)) {
      return hash;
    }

    const savedScreen = localStorage.getItem('handyland_active_screen');
    if (savedScreen && ['screen1', 'screen2', 'screen3', 'admin', 'menu'].includes(savedScreen)) {
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

  const [customLogo, setCustomLogo] = useState(null);
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

  const t = translations[lang] || translations.de;

  const navigateTo = (newView) => {
    window.history.pushState({ view: newView }, '', '#' + newView);
    localStorage.setItem('handyland_active_screen', newView);
    setView(newView);
  };

  const navigateBack = () => {
    window.history.back();
  };

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('handyland_lang', newLang);
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

      const { data: settingsData, error: setErr } = await supabase.from('shop_settings').select('*').eq('id', 'config').single();
      if (!setErr && settingsData) {
        offlineCache.saveSettings(settingsData);
        setCustomLogo(settingsData.logoData || null);
        setTickerText(settingsData.tickerText || DEFAULT_TICKER);
        setTickerSpeed(settingsData.tickerSpeed || DEFAULT_TICKER_SPEED);
        setFontSize(settingsData.fontSize || DEFAULT_FONT_SIZE);
        setHeaderSubtitle(settingsData.headerSubtitle || DEFAULT_SUBTITLE);
        setIntervalScreen1(settingsData.intervalScreen1 || 6);
        setIntervalScreen2(settingsData.intervalScreen2 || 6);
        setIntervalScreen3(settingsData.intervalScreen3 || 6);
        setAdminPin(settingsData.adminPin || DEFAULT_PIN);
        setCityName(settingsData.cityName || DEFAULT_CITY);
        setMaintenanceMode(settingsData.maintenanceMode || false);
        setMaintenanceMessage(settingsData.maintenanceMessage || '');
        setStoreStatusMode(settingsData.storeStatusMode || 'active');
        setStatusTimerTarget(settingsData.statusTimerTarget || '');
        
        if (settingsData.forceReload && settingsData.forceReload > initialLoadTime) {
          window.location.reload();
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
        if (cachedSettings.maintenanceMode !== undefined) setMaintenanceMode(cachedSettings.maintenanceMode);
        if (cachedSettings.maintenanceMessage !== undefined) setMaintenanceMessage(cachedSettings.maintenanceMessage);
        if (cachedSettings.storeStatusMode !== undefined) setStoreStatusMode(cachedSettings.storeStatusMode);
        if (cachedSettings.statusTimerTarget !== undefined) setStatusTimerTarget(cachedSettings.statusTimerTarget);
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchAllData]);

  const handleVerifyPin = (inputPin) => {
    if (inputPin === (adminPin || DEFAULT_PIN)) {
      setShowPinModal(false);
      navigateTo('admin');
      return true;
    }
    return false;
  };

  const renderActiveView = () => {
    if (view === 'admin') return (
      <AdminPanel 
        devices={devices} repairs={repairs} offers={offers} customLogo={customLogo} tickerText={tickerText} 
        tickerSpeed={tickerSpeed} fontSize={fontSize} headerSubtitle={headerSubtitle} intervalScreen1={intervalScreen1} 
        intervalScreen2={intervalScreen2} intervalScreen3={intervalScreen3} adminPin={adminPin} cityName={cityName}
        onBack={navigateBack} onRefresh={fetchAllData} lang={lang} setLang={handleSetLang} t={t} 
        maintenanceMode={maintenanceMode} maintenanceMessage={maintenanceMessage}
        storeStatusMode={storeStatusMode} statusTimerTarget={statusTimerTarget}
      />
    );

    if (maintenanceMode || (storeStatusMode && storeStatusMode !== 'active')) return (
      <StoreStatusScreen 
        t={t} lang={lang} customLogo={customLogo} 
        storeStatusMode={maintenanceMode && storeStatusMode === 'active' ? 'maintenance' : storeStatusMode}
        maintenanceMessage={maintenanceMessage} 
        statusTimerTarget={statusTimerTarget}
      />
    );

    if (view === 'screen1') return (
      <ImageSlideshowScreen 
        items={devices} title="Top Angebote & Smartphones" icon={Smartphone} 
        customLogo={customLogo} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen1} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
      />
    );

    if (view === 'screen2') return (
      <ImageSlideshowScreen 
        items={repairs} title="Reparaturzentrum & Preise" icon={Wrench} 
        customLogo={customLogo} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen2} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
      />
    );

    if (view === 'screen3') return (
      <ImageSlideshowScreen 
        items={offers} title="Angebote & News" icon={Tag} showNewsTicker={true} 
        customLogo={customLogo} tickerText={tickerText} tickerSpeed={tickerSpeed} 
        headerSubtitle={headerSubtitle} slideInterval={intervalScreen3} cityName={cityName} 
        onBack={navigateBack} t={t} lang={lang} isOffline={isOffline} 
      />
    );

    return (
      <MainMenu 
        navigateTo={navigateTo} customLogo={customLogo} lang={lang} 
        setLang={handleSetLang} t={t} showPinModal={showPinModal} 
        setShowPinModal={setShowPinModal} handleVerifyPin={handleVerifyPin} 
      />
    );
  };

  return (
    <>
      <AutoMemoryRefresh />
      {renderActiveView()}
    </>
  );
}
