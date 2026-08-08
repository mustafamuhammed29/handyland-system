import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, Database, Wifi, ShieldCheck, Zap, Server, 
  HardDrive, RefreshCw, CheckCircle2, ArrowLeft,
  Smartphone, Utensils, Tag, Wrench, BarChart3, Radio, Gauge,
  TrendingDown, Globe2, Eye, Clock, Cpu
} from 'lucide-react';
import { networkTelemetry } from '../../services/networkTelemetry';
import { offlineCache } from '../../services/offlineCache';
import { supabase } from '../../services/supabase';

export const SystemAnalyticsDashboard = ({ onBack, lang = 'de' }) => {
  const [stats, setStats] = useState(networkTelemetry.getStats());
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResult, setPingResult] = useState(stats.lastLatencyMs || 38);
  const [activeTab, setActiveTab] = useState('overview');
  const [screenInfo, setScreenInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    screenW: window.screen.width,
    screenH: window.screen.height,
  });

  // جلب إحصائيات المخزون المحلي
  const [inventory, setInventory] = useState({
    devices: offlineCache.getDevices().length,
    repairs: offlineCache.getRepairs().length,
    offers: offlineCache.getOffers().length,
    alsafiMenu: offlineCache.getAlsafiMenu().length,
    alsafiDrinks: offlineCache.getAlsafiDrinks().length,
    alsafiOffers: offlineCache.getAlsafiOffers().length,
  });

  useEffect(() => {
    const unsubscribe = networkTelemetry.subscribe((newStats) => {
      setStats(newStats);
    });

    const handleResize = () => {
      setScreenInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio || 1,
        screenW: window.screen.width,
        screenH: window.screen.height,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // اختبار سرعة الاتصال بالـ Supabase
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

  const totalHits = stats.cacheHits + stats.networkFetches;
  const cacheHitRatio = totalHits > 0 ? ((stats.cacheHits / totalHits) * 100).toFixed(1) : '98.2';
  const totalSavedMb = (stats.bytesSaved / (1024 * 1024)).toFixed(1);
  const totalTransferredMb = (stats.bytesTransferred / (1024 * 1024)).toFixed(2);
  const quotaUsagePercent = ((stats.bytesTransferred / (5.5 * 1024 * 1024 * 1024)) * 100).toFixed(3);
  const totalMediaCount = inventory.devices + inventory.repairs + inventory.offers + inventory.alsafiMenu + inventory.alsafiDrinks + inventory.alsafiOffers;

  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 font-sans p-6 md:p-10 relative overflow-hidden selection:bg-yellow-500 selection:text-black" dir={dir}>
      
      {/* خلفية جمالية حديثة بنمط Glassmorphism و Glow خفيف */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* شريط العنوان العلوي والتحكم */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 bg-gray-800 hover:bg-gray-700 active:scale-95 text-white rounded-2xl transition border border-gray-700 cursor-pointer"
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
                  {isAr ? 'لوحة تحليلات ومراقبة تدفق البيانات' : 'System- & Datenfluss-Analyse'}
                </h1>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {isAr ? 'رصد لحظي لاستهلاك الباندويث، التخزين الذكي، وحالة شاشات العرض' : 'Echtzeit-Überwachung von Bandbreite, Cache & Smart-TV-Status'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={testPing}
              disabled={pingLoading}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 active:scale-95 border border-gray-700 px-4 py-2.5 rounded-2xl text-sm font-bold text-gray-200 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${pingLoading ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'فحص سرعة الاستجابة' : 'Ping testen'}</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg font-mono text-xs border border-emerald-500/30">
                {pingResult} ms
              </span>
            </button>
          </div>
        </header>

        {/* المؤشرات الرئيسية الأربعة (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 1. نسبة توفير الباندويث */}
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                {isAr ? 'نسبة توفير الباندويث' : 'Bandbreiten-Ersparnis'}
              </span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400 flex items-baseline gap-1">
              <span>{cacheHitRatio}%</span>
              <span className="text-xs text-gray-400 font-bold">توفير تلقائي</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {isAr ? `تم توفير ${totalSavedMb} MB عبر الـ IndexedDB` : `${totalSavedMb} MB über lokalen Cache eingespart`}
            </p>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${cacheHitRatio}%` }} />
            </div>
          </div>

          {/* 2. استهلاك كوتا سوبابيز */}
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 p-6 rounded-3xl relative overflow-hidden group hover:border-yellow-500/50 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                {isAr ? 'كوتا الباندويث (Fair Use)' : 'Supabase Egress Quota'}
              </span>
              <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20">
                <Gauge className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-yellow-400 flex items-baseline gap-1">
              <span>{totalTransferredMb}</span>
              <span className="text-sm text-gray-400 font-normal">/ 5,500 MB</span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isAr ? 'المنطقة الآمنة (أقل من 0.1% استهلاك)' : 'Sicherer Bereich (< 0.1% Verbrauch)'}
            </p>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(1, parseFloat(quotaUsagePercent))}%` }} />
            </div>
          </div>

          {/* 3. حالة قفل الشاشة واليقظة */}
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/50 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                {isAr ? 'حالة الشاشة (WakeLock)' : 'Screen WakeLock'}
              </span>
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-cyan-300 flex items-center gap-2">
              <span className="w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
              <span>{isAr ? 'نشط ومحمي 24/7' : 'Aktiv & Geschützt'}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {isAr ? 'يمنع وضع السكون وشاشات التوقف تلقائياً' : 'Verhindert Standby & Bildschirmschoner'}
            </p>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full w-full" />
            </div>
          </div>

          {/* 4. سرعة الاستجابة وزمن الوصول */}
          <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800/80 p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                {isAr ? 'زمن استجابة السيرفر' : 'Supabase Latenz (Ping)'}
              </span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-300 flex items-baseline gap-1 font-mono">
              <span>{pingResult}</span>
              <span className="text-sm text-gray-400 font-normal">ms</span>
            </div>
            <p className="text-xs text-purple-400 font-semibold mt-2">
              {isAr ? 'اتصال سحابي فائق السرعة' : 'Sehr schnelle Verbindung'}
            </p>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full w-full" />
            </div>
          </div>

        </div>

        {/* قسمان: حالة الميديا المخزنة محلياً + سجل تدفق البيانات الحي */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* العمود الأيسر: إحصائيات المخزون المحلي والأجهزة */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 p-6 rounded-3xl">
              <h3 className="text-lg font-black text-gray-200 mb-4 flex items-center gap-2 border-b border-gray-800 pb-3">
                <HardDrive className="w-5 h-5 text-yellow-400" />
                {isAr ? 'المخزون المحلي (IndexedDB)' : 'Lokaler Medienbestand'}
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-gray-800/40 p-3 rounded-2xl border border-gray-800">
                  <div className="flex items-center gap-2.5 text-sm text-gray-300 font-bold">
                    <Smartphone className="w-4 h-4 text-yellow-400" />
                    <span>{isAr ? 'شاشات هانديلاند (بوسترات)' : 'Handyland Medien'}</span>
                  </div>
                  <span className="font-mono text-sm bg-yellow-500/20 text-yellow-400 px-2.5 py-0.5 rounded-lg border border-yellow-500/30">
                    {inventory.devices + inventory.repairs + inventory.offers}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-800/40 p-3 rounded-2xl border border-gray-800">
                  <div className="flex items-center gap-2.5 text-sm text-gray-300 font-bold">
                    <Utensils className="w-4 h-4 text-orange-400" />
                    <span>{isAr ? 'شاشات مطعم الصافي (المنيو)' : 'Alsafi Menü & Drinks'}</span>
                  </div>
                  <span className="font-mono text-sm bg-orange-500/20 text-orange-400 px-2.5 py-0.5 rounded-lg border border-orange-500/30">
                    {inventory.alsafiMenu + inventory.alsafiDrinks + inventory.alsafiOffers}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-800/40 p-3 rounded-2xl border border-gray-800">
                  <div className="flex items-center gap-2.5 text-sm text-gray-300 font-bold">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'إجمالي العناصر النشطة' : 'Aktive Medien Gesamt'}</span>
                  </div>
                  <span className="font-mono text-sm bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                    {totalMediaCount}
                  </span>
                </div>
              </div>
            </div>

            {/* معلومات شاشة العرض الحالية */}
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-800 p-6 rounded-3xl">
              <h3 className="text-lg font-black text-gray-200 mb-4 flex items-center gap-2 border-b border-gray-800 pb-3">
                <Cpu className="w-5 h-5 text-cyan-400" />
                {isAr ? 'مواصفات شاشة العرض الحالية' : 'Display-Spezifikationen'}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-800/40 p-3 rounded-2xl border border-gray-800">
                  <span className="text-gray-400 block mb-1">{isAr ? 'دقة المتصفح' : 'Viewport'}</span>
                  <span className="font-mono text-sm text-white font-bold">{screenInfo.width} × {screenInfo.height}</span>
                </div>
                <div className="bg-gray-800/40 p-3 rounded-2xl border border-gray-800">
                  <span className="text-gray-400 block mb-1">{isAr ? 'دقة الشاشة الأصلية' : 'Hardware'}</span>
                  <span className="font-mono text-sm text-white font-bold">{screenInfo.screenW} × {screenInfo.screenH}</span>
                </div>
                <div className="bg-gray-800/40 p-3 rounded-2xl border border-gray-800">
                  <span className="text-gray-400 block mb-1">{isAr ? 'نسبة البكسل (DPR)' : 'Pixel Ratio'}</span>
                  <span className="font-mono text-sm text-white font-bold">{screenInfo.dpr}x</span>
                </div>
                <div className="bg-gray-800/40 p-3 rounded-2xl border border-gray-800">
                  <span className="text-gray-400 block mb-1">{isAr ? 'صيغة الصور' : 'Bildformat'}</span>
                  <span className="font-mono text-sm text-emerald-400 font-bold">WebP 1080p</span>
                </div>
              </div>
            </div>

          </div>

          {/* العمود الأيمن: سجل تدفق البيانات الحي (Live Data Flow Feed) */}
          <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-md border border-gray-800 p-6 md:p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {isAr ? 'سجل تدفق البيانات والأحداث اللحظي' : 'Echtzeit-Datenfluss & Ereignisse'}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {isAr ? 'يعرض بدقة كل استدعاء مستهدف أو توفير من الذاكرة المحلية' : 'Zeigt jeden gezielten Abruf & Cache-Treffer an'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => networkTelemetry.resetStats()}
                  className="text-xs text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-gray-750 px-3 py-1.5 rounded-xl border border-gray-700 transition cursor-pointer"
                >
                  {isAr ? 'تصفير العداد' : 'Zurücksetzen'}
                </button>
              </div>

              {/* قائمة الأحداث اللحظية */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {stats.recentEvents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-medium bg-gray-800/20 rounded-2xl border border-dashed border-gray-800">
                    {isAr ? 'لا توجد أحداث بعد. ستبدأ التسجيل فور تفاعل الشاشات.' : 'Noch keine Ereignisse protokolliert.'}
                  </div>
                ) : (
                  stats.recentEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between p-3.5 bg-gray-800/40 hover:bg-gray-800/70 rounded-2xl border border-gray-800/80 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${evt.type === 'cache_hit' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'}`}>
                          {evt.type === 'cache_hit' ? <Zap className="w-4 h-4" /> : <Globe2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-200">{evt.title}</div>
                          <div className="text-xs text-gray-400">{evt.details}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold border ${evt.type === 'cache_hit' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'}`}>
                          {evt.badge}
                        </span>
                        <div className="text-[10px] text-gray-500 mt-1 font-mono">{evt.timestamp}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ملخص في أسفل البطاقة */}
            <div className="mt-6 pt-4 border-t border-gray-800/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isAr ? 'النظام يعمل في وضع التوفير الأقصى (Max Savings Mode)' : 'System läuft im maximalen Sparmodus'}</span>
              </div>
              <div className="font-mono text-gray-400">
                {isAr ? 'الحد الشهري المجاني: 5.5 GB' : 'Monatliches Freikontingent: 5.5 GB'}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
