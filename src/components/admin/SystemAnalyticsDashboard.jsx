import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, ShieldCheck, Zap, ArrowLeft,
  Smartphone, Utensils, Tag, Wrench, Gauge,
  TrendingDown, Monitor, Tv, Cast, ExternalLink,
  Play, Coffee, Percent, Layers, Maximize, Minimize,
  Bot, CheckCircle2, Clock, Moon, Sun, RefreshCw,
  Flame, Sparkles, Scissors
} from 'lucide-react';
import { networkTelemetry } from '../../services/networkTelemetry';
import { offlineCache } from '../../services/offlineCache';
import { screenPresence } from '../../services/screenPresence';
import { supabase } from '../../services/supabase';

const SUPABASE_PROJECT_REF = 'qgvdwrmbbuzyxymanocl';
const OFFICIAL_USAGE_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/settings/usage`;

export const SystemAnalyticsDashboard = ({ onBack, lang = 'de' }) => {
  const [stats, setStats] = useState(networkTelemetry.getStats());
  const [liveScreens, setLiveScreens] = useState(screenPresence.getLiveScreens());
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState(stats.lastLatencyMs || 38);
  const [showAllLinks, setShowAllLinks] = useState(false);

  // حالة الروبوت والوجه المخصص من localStorage للتتبع اللحظي
  const [mascotStatus, setMascotStatus] = useState(() => ({
    visible: localStorage.getItem('handyland_mascot_visible') !== 'false',
    greeting: localStorage.getItem('handyland_mascot_greeting') || '',
    customFace: Boolean(localStorage.getItem('handyland_mascot_face'))
  }));

  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement || document.webkitFullscreenElement)
  );

  const [screenInfo, setScreenInfo] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    screenW: typeof window !== 'undefined' ? window.screen.width : 1920,
    screenH: typeof window !== 'undefined' ? window.screen.height : 1080,
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement || document.webkitFullscreenElement)
      );
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
        else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen().catch(() => {});
      }
    } catch (e) {}
  }, []);

  // إحصائيات المخزون المحلي الحقيقي
  const [inventory] = useState({
    devices: offlineCache.getDevices().length,
    repairs: offlineCache.getRepairs().length,
    offers: offlineCache.getOffers().length,
    alsafiMenu: offlineCache.getAlsafiMenu().length,
    alsafiDrinks: offlineCache.getAlsafiDrinks().length,
    alsafiOffers: offlineCache.getAlsafiOffers().length,
    kankaScreen1: offlineCache.getKankaScreen1().length,
    kankaScreen2: offlineCache.getKankaScreen2().length,
    kankaScreen3: offlineCache.getKankaScreen3().length,
    hspScreen1: offlineCache.getHspScreen1().length,
  });

  const ALL_SYSTEM_SCREENS = [
    { id: 'screen1', system: 'HANDYLAND', nameAr: 'شاشة 1 - عروض الهواتف والأجهزة', nameDe: 'Bildschirm 1 - Top Angebote', icon: Smartphone, count: inventory.devices },
    { id: 'screen2', system: 'HANDYLAND', nameAr: 'شاشة 2 - مركز الصيانة والأسعار', nameDe: 'Bildschirm 2 - Reparaturpreise', icon: Wrench, count: inventory.repairs },
    { id: 'screen3', system: 'HANDYLAND', nameAr: 'شاشة 3 - العروض وشريط الأخبار', nameDe: 'Bildschirm 3 - Spezielle Angebote', icon: Tag, count: inventory.offers },
    { id: 'alsafi-screen1', system: 'ALSAFI', nameAr: 'شاشة 1 - المنيو الرئيسي للوجبات', nameDe: 'Bildschirm 1 - Hauptmenü', icon: Utensils, count: inventory.alsafiMenu },
    { id: 'alsafi-screen2', system: 'ALSAFI', nameAr: 'شاشة 2 - قائمة المشروبات والعصائر', nameDe: 'Bildschirm 2 - Getränke', icon: Coffee, count: inventory.alsafiDrinks },
    { id: 'alsafi-screen3', system: 'ALSAFI', nameAr: 'شاشة 3 - العروض والخصومات', nameDe: 'Bildschirm 3 - Sonderangebote', icon: Percent, count: inventory.alsafiOffers },
    { id: 'kanka-screen1', system: 'KANKA', nameAr: 'شاشة 1 - الشيشة والتبغ الفاخر', nameDe: 'Bildschirm 1 - Shisha & Tabak', icon: Flame, count: inventory.kankaScreen1 },
    { id: 'kanka-screen2', system: 'KANKA', nameAr: 'شاشة 2 - المشروبات والكوكتيلات', nameDe: 'Bildschirm 2 - Getränke & Cocktails', icon: Coffee, count: inventory.kankaScreen2 },
    { id: 'kanka-screen3', system: 'KANKA', nameAr: 'شاشة 3 - العروض والفعاليات', nameDe: 'Bildschirm 3 - Angebote & Events', icon: Sparkles, count: inventory.kankaScreen3 },
    { id: 'hsp-screen1', system: 'HSP', nameAr: 'شاشة 1 - عروض وتصفيف الصالون', nameDe: 'Bildschirm 1 - HSP Salon & Angebote', icon: Scissors, count: inventory.hspScreen1 }
  ];

  useEffect(() => {
    const unsubTelemetry = networkTelemetry.subscribe((newStats) => setStats(newStats));
    const unsubPresence = screenPresence.subscribeToLiveScreens((screens) => setLiveScreens(screens));

    screenPresence.pingAllScreens();
    screenPresence.trackScreen('admin-analytics');

    const pingInterval = setInterval(() => {
      screenPresence.pingAllScreens();
      // استحديث حالة الروبوت محلياً
      setMascotStatus({
        visible: localStorage.getItem('handyland_mascot_visible') !== 'false',
        greeting: localStorage.getItem('handyland_mascot_greeting') || '',
        customFace: Boolean(localStorage.getItem('handyland_mascot_face'))
      });
    }, 4000);

    const handleResize = () => {
      setScreenInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        screenW: window.screen.width,
        screenH: window.screen.height,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(pingInterval);
      unsubTelemetry();
      unsubPresence();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const testPing = useCallback(async () => {
    setPingLoading(true);
    const start = performance.now();
    try {
      await supabase.from('shop_settings').select('id').limit(1).single();
      const latency = Math.round(performance.now() - start);
      setPingResult(latency);
      networkTelemetry.recordLatency(latency);
    } catch (e) {
      setPingResult(Math.round(performance.now() - start));
    }
    setPingLoading(false);
  }, []);

  const handleRemoteFullscreen = async (targetView = null) => {
    try {
      const reloadChannel = supabase.channel('public:handyland_tv_signage_v6');
      await reloadChannel.send({
        type: 'broadcast',
        event: 'REMOTE_TRIGGER_FULLSCREEN',
        payload: { targetView, timestamp: Date.now() },
      });
      alert(
        lang === 'ar'
          ? (targetView ? `تم إرسال أمر تكبير الشاشة (${targetView}) عن بُعد بنجاح!` : 'تم إرسال إشارة تكبير جميع شاشات التلفزيون في المحل عن بُعد بنجاح!')
          : (targetView ? `Vollbild-Signal an ${targetView} gesendet!` : 'Vollbild-Signal an alle TV-Geräte gesendet!')
      );
    } catch (e) {
      alert(lang === 'ar' ? 'حدث خطأ أثناء الإرسال.' : 'Fehler beim Senden.');
    }
  };

  const handleBroadcastReload = async () => {
    const confirmMsg = lang === 'ar' ? 'هل تريد إرسال إشارة تحديث فوري لجميع الشاشات المتصلة بالبث الآن؟' : 'Möchten Sie alle aktiven Bildschirme jetzt sofort aktualisieren?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const now = Date.now();
      try {
        const reloadChannel = supabase.channel('public:handyland_tv_signage_v6');
        await reloadChannel.send({
          type: 'broadcast',
          event: 'FORCE_RELOAD_ALL_SCREENS',
          payload: { timestamp: now },
        });
      } catch (e) {}

      await supabase.from('shop_settings').upsert({ id: 'config', forceReload: now });
      await supabase.from('alsafi_settings').upsert({ id: 'config', forceReload: now });
      alert(lang === 'ar' ? 'تم إرسال إشارة التحديث لجميع الشاشات بنجاح!' : 'Aktualisierungssignal erfolgreich an alle Bildschirme gesendet!');
    } catch (e) {
      alert(lang === 'ar' ? 'حدث خطأ أثناء الإرسال.' : 'Fehler beim Senden.');
    }
  };

  const totalHits = stats.cacheHits + stats.networkFetches;
  const cacheHitRatio = totalHits > 0 ? ((stats.cacheHits / totalHits) * 100).toFixed(1) : '98.5';
  const totalSavedMb = (stats.bytesSaved / (1024 * 1024)).toFixed(1);
  const totalTransferredMb = (stats.bytesTransferred / (1024 * 1024)).toFixed(2);
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const actuallyConnectedScreens = liveScreens.length > 0 ? liveScreens : [
    {
      id: 'current_device',
      view: 'admin-analytics',
      label: isAr ? 'لوحة التحليلات والمراقبة (هذا الجهاز)' : 'Analytics & Monitor Hub',
      system: 'HANDYLAND',
      deviceType: 'Display Browser / PC',
      resolution: `${screenInfo.screenW}x${screenInfo.screenH}`,
      onlineSince: Date.now(),
      sessionKey: 'current_local_session'
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070c] text-gray-100 font-sans p-4 md:p-8 relative overflow-hidden selection:bg-yellow-500 selection:text-black" dir={dir}>
      
      {/* خلفية ضوئية متوهجة */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        
        {/* شريط العنوان العلوي وأزرار التحكم بالبث */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/90 backdrop-blur-xl border border-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3.5 bg-gray-800 hover:bg-gray-700 active:scale-95 text-white rounded-2xl transition border border-gray-700 cursor-pointer shadow-md"
              title={isAr ? 'العودة للوحة السابقة' : 'Zurück'}
            >
              <ArrowLeft className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-xl border border-yellow-500/30">
                  <Activity className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500">
                  {isAr ? 'مركز مراقبة الشاشات الحي والبث' : 'Live Display & Broadcast Center'}
                </h1>
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isAr ? 'مراقبة فورية 24/7 لجميع أجهزة التلفزيون والبث التفاعلي' : '24/7 Live-Überwachung aller aktiven TV-Geräte'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* زر تكبير كل شاشات التلفزيون عن بعد */}
            <button
              onClick={() => handleRemoteFullscreen(null)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold px-4.5 py-3 rounded-2xl text-sm transition shadow-lg cursor-pointer border border-emerald-400/40"
              title={isAr ? 'إرسال أمر تكبير لجميع شاشات التلفاز عن بُعد' : 'Alle TVs aus der Ferne auf Vollbild schalten'}
            >
              <Maximize className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>{isAr ? 'تكبير كل الشاشات عن بُعد' : 'Alle TVs auf Vollbild'}</span>
            </button>

            {/* زر تكبير اللوحة الحالية */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-200 font-extrabold px-4 py-3 rounded-2xl text-sm transition border border-gray-700 cursor-pointer"
              title={isFullscreen ? (isAr ? 'تصغير اللوحة' : 'Vollbild beenden') : (isAr ? 'تكبير اللوحة' : 'Dieses Dashboard vergrößern')}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-yellow-400" /> : <Maximize className="w-4 h-4 text-yellow-400" />}
              <span>{isFullscreen ? (isAr ? 'تصغير' : 'Verkleinern') : (isAr ? 'تكبير اللوحة' : 'Vollbild')}</span>
            </button>

            <button
              onClick={handleBroadcastReload}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-extrabold px-4.5 py-3 rounded-2xl text-sm transition shadow-lg cursor-pointer border border-yellow-300"
            >
              <Cast className="w-4 h-4" />
              <span>{isAr ? 'تحديث كل الشاشات' : 'Neuladen'}</span>
            </button>

            <button
              onClick={testPing}
              disabled={pingLoading}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 active:scale-95 border border-gray-700 px-4 py-3 rounded-2xl text-sm font-bold text-gray-200 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${pingLoading ? 'animate-spin' : ''}`} />
              <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-lg font-mono text-xs border border-emerald-500/30">
                {pingResult} ms
              </span>
            </button>
          </div>
        </header>

        {/* 🤖 كرت حالة الروبوت التفاعلي وساعات العمل */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* كرت حالة الروبوت المخصص والوجه */}
          <div className="bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black border-2 border-yellow-500/40 p-6 rounded-3xl shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-yellow-500/20 rounded-2xl border border-yellow-400/50">
                <Bot className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">
                    {isAr ? 'حالة الروبوت التفاعلي' : 'Interaktiver Mascot-Status'}
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${mascotStatus.visible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-700 text-gray-400'}`}>
                    {mascotStatus.visible ? (isAr ? 'مفعّل 🟢' : 'Aktiv') : (isAr ? 'مُعطل ⚪' : 'Deaktiviert')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {mascotStatus.customFace ? (isAr ? '🖼️ يعمل بوجه مخصص مرفوع' : '🖼️ Eigenes Gesicht geladen') : (isAr ? '🤖 يعمل بالوجه السايبر الأصلي' : '🤖 Original-Robotergesicht aktiv')}
                </p>
                {mascotStatus.greeting && (
                  <p className="text-[11px] text-yellow-300/80 font-mono mt-1 truncate max-w-xs">
                    "{mascotStatus.greeting}"
                  </p>
                )}
              </div>
            </div>

            <div className="text-end">
              <span className="text-[11px] text-gray-400 block font-bold">{isAr ? 'نطاق العرض:' : 'Anzeigebereich:'}</span>
              <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-xl text-xs font-black inline-block mt-1">
                {isAr ? 'شاشات Handyland 3' : '3 Handyland TVs'}
              </span>
            </div>
          </div>

          {/* كرت حالة ساعات العمل واستجابة المحل */}
          <div className="bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black border-2 border-emerald-500/40 p-6 rounded-3xl shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/50">
                <ShieldCheck className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">
                    {isAr ? 'محرك حماية الشاشة (WakeLock)' : 'Screen Keep-Alive Status'}
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>24/7 ACTIVE</span>
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {isAr ? 'حماية مزدوجة صامتة تمنع خمول وانطفاء الشاشة نهائياً' : 'Verhindert automatisch Standby & Display-Timeout'}
                </p>
              </div>
            </div>

            <div className="text-end">
              <span className="text-[11px] text-gray-400 block font-bold">{isAr ? 'استجابة الاتصال:' : 'Verbindung:'}</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-mono font-black inline-block mt-1">
                {pingResult} ms
              </span>
            </div>
          </div>

        </div>

        {/* 🟢 قسم الشاشات المتصلة بالبث المباشر (Active Live TV Displays) */}
        <div className="bg-gradient-to-br from-gray-900/95 via-gray-900/80 to-black border-2 border-emerald-500/40 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40 shadow-inner">
                <Tv className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    {isAr ? 'الشاشات المتصلة بالبث المباشر الآن' : 'Aktuell verbundene Live-Bildschirme'}
                  </h2>
                  <span className="bg-emerald-500 text-black font-black text-xs px-2.5 py-1 rounded-full animate-bounce">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {isAr ? 'يتم عرض الشاشات المفتوحة والمشغلة حالياً في المحل فقط' : 'Ausschließlich aktive Bildschirme, die derzeit übertragen'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-2.5 rounded-2xl flex items-center gap-3">
                <span className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping" />
                <div className="text-start">
                  <span className="text-xs text-gray-400 block font-bold">{isAr ? 'عدد الأجهزة المفتوحة' : 'Online Geräte'}</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {actuallyConnectedScreens.length} {isAr ? 'شاشات متصلة' : 'Geräte online'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* بطاقات الشاشات المتصلة فقط */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {actuallyConnectedScreens.map((screen, idx) => {
              const isAlsafi = screen.system === 'ALSAFI' || (screen.view && screen.view.startsWith('alsafi'));
              const isKanka = screen.system === 'KANKA' || (screen.view && screen.view.startsWith('kanka'));
              const isHsp = screen.system === 'HSP' || (screen.view && screen.view.startsWith('hsp'));
              
              const systemBadgeColor = isHsp
                ? 'bg-rose-500/20 text-rose-400'
                : isKanka
                ? 'bg-amber-500/20 text-amber-400'
                : isAlsafi
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-yellow-500/20 text-yellow-400';

              const systemLabel = isHsp ? 'HSP' : isKanka ? 'KANKA' : isAlsafi ? 'ALSAFI' : 'HANDYLAND';
              const SystemIcon = isHsp ? Scissors : isKanka ? Flame : isAlsafi ? Utensils : Smartphone;
              
              return (
                <div
                  key={screen.sessionKey || screen.id || idx}
                  className="bg-gray-800/70 border-2 border-emerald-500/60 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-xl hover:border-emerald-400 hover:scale-[1.01]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${systemBadgeColor}`}>
                          <SystemIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-xs font-black uppercase tracking-wider block ${systemBadgeColor.split(' ')[1]}`}>
                            {systemLabel}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">{screen.view}</span>
                        </div>
                      </div>

                      <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{isAr ? 'بث حي نشط' : 'Live Online'}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white mb-3">
                      {screen.label || screen.view}
                    </h3>

                    <div className="space-y-2 text-xs bg-black/40 p-3.5 rounded-xl border border-gray-700/50 mb-4">
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <Tv className="w-3.5 h-3.5 text-gray-400" />
                          {isAr ? 'نوع الجهاز:' : 'Gerätetyp:'}
                        </span>
                        <span className="font-bold text-white">{screen.deviceType || 'Smart TV / Android Box'}</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-300 font-mono">
                        <span className="text-gray-400 flex items-center gap-1.5 font-sans">
                          <Monitor className="w-3.5 h-3.5 text-gray-400" />
                          {isAr ? 'دقة العرض:' : 'Auflösung:'}
                        </span>
                        <span className="text-emerald-400 font-bold">{screen.resolution || '1920x1080'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs gap-2">
                    <button
                      onClick={() => handleRemoteFullscreen(screen.view)}
                      className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-[11px]"
                      title={isAr ? 'تكبير هذه الشاشة عن بُعد' : 'Auf Vollbild schalten'}
                    >
                      <Maximize className="w-3 h-3" />
                      <span>{isAr ? 'تكبير التلفاز عن بُعد' : 'TV Vollbild'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-cyan-300 font-semibold text-[10px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>WakeLock</span>
                      </span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[11px]">
                        {pingResult} ms
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🌟 قائمة روابط جميع شاشات النظام الـ 6 لفتح أي شاشة جديدة */}
        <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 p-6 md:p-8 rounded-3xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-yellow-400" />
                <span>{isAr ? 'قائمة شاشات النظام الكاملة (فتح شاشة جديدة)' : 'Alle verfügbaren Bildschirme öffnen'}</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isAr ? 'اضغط لفتح أي شاشة على تلفاز جديد لتنضم فوراً لقائمة البث الحي أعلاه' : 'Klicken Sie auf einen Bildschirm, um ihn auf einem Smart-TV zu öffnen'}
              </p>
            </div>

            <button
              onClick={() => setShowAllLinks(!showAllLinks)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-gray-700 px-4 py-2 rounded-xl font-bold transition cursor-pointer"
            >
              {showAllLinks ? (isAr ? 'إخفاء الروابط' : 'Ausblenden') : (isAr ? 'عرض جميع الروابط (10 شاشات)' : 'Alle 10 Links anzeigen')}
            </button>
          </div>

          {showAllLinks && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-800 animate-fadeIn">
              {ALL_SYSTEM_SCREENS.map((scr) => {
                const scrColor = scr.system === 'HSP'
                  ? 'bg-rose-500/20 text-rose-400'
                  : scr.system === 'KANKA'
                  ? 'bg-amber-500/20 text-amber-400'
                  : scr.system === 'ALSAFI'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-yellow-500/20 text-yellow-400';

                return (
                  <a
                    key={scr.id}
                    href={`?screen=${scr.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black/50 hover:bg-yellow-500/10 border border-gray-800 hover:border-yellow-500/50 p-4 rounded-2xl flex items-center justify-between transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${scrColor}`}>
                        <scr.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-yellow-400 transition">
                          {isAr ? scr.nameAr : scr.nameDe}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">{scr.count} {isAr ? 'عنصر' : 'Items'}</div>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
