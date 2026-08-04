import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Settings, Smartphone, Wrench, Tag, Plus, Trash2, 
  ArrowRight, ArrowLeft, Info, Globe, Maximize, Minimize, Image as ImageIcon,
  Battery, Cpu, Zap, Upload, RotateCcw, Type, Save, Languages, Layout,
  Clock, Sun, Lock, Key, ShieldCheck, Timer, CloudSun, CloudRain, Snowflake, CloudLightning
} from 'lucide-react';

// إعدادات Supabase الخاصة بمشروع HANDYLAND
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qgvdwrmbbuzyxymanocl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YS66UTEClfU2fIu3eJtjhA_4mf9r5ww';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const goldTextGradient = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600";
const darkBg = "bg-[#050505]";
const DEFAULT_TICKER = "*** Willkommen bei HANDYLAND! *** An- und Verkauf von Smartphones *** Professionelle Express-Reparatur mit Garantie *** Original Zubehör und Hüllen ***";
const DEFAULT_SUBTITLE = "An- und Verkauf • Reparatur";
const DEFAULT_PIN = "1234";

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// --- قاموس الترجمات المزدوج (Deutsch & العربية) ---
const translations = {
  de: {
    systemTitle: "HANDYLAND Steuerungssystem",
    adminTitle: "HANDYLAND Verwaltungskonsole",
    backToMenu: "Hauptmenü",
    returnToMenuBtn: "Zurück zum Hauptmenü",
    screen1Title: "Bildschirm 1",
    screen1Sub: "Smartphones & Plakate",
    screen2Title: "Bildschirm 2",
    screen2Sub: "Reparatur (Plakate + Menü)",
    screen3Title: "Bildschirm 3",
    screen3Sub: "Angebote & News Ticker",
    adminBtnTitle: "Verwaltung",
    adminBtnSub: "Plakate, Logo & News verwalten",
    tabDevices: "Bildschirm 1 (Smartphones)",
    tabRepairs: "Bildschirm 2 (Reparatur)",
    tabOffers: "Bildschirm 3 (Angebote)",
    tabSettings: "Einstellungen (Logo, PIN, Timer & Wetter)",
    uploadTitle: "Plakat hochladen für",
    selectImagePrompt: "Klicken Sie hier, um ein Bild auszuwählen",
    noCropNote: "(Das Bild wird zu 100% ohne Abschneiden angezeigt)",
    changeImage: "Bild ändern",
    uploadBtn: "Plakat auf Bildschirm hochladen",
    uploading: "Wird hochgeladen...",
    displayedPosters: "Angezeigte Plakate auf",
    noPosters: "Derzeit sind keine Plakate für diesen Bildschirm hochgeladen.",
    posterLabel: "Plakat",
    deletePosterTooltip: "Plakat löschen",
    tickerControlTitle: "Lauftext-Steuerung (HANDYLAND News)",
    tickerInstruction: "Dieser Text läuft live unten auf Bildschirm 3 (Angebote):",
    tickerInputLabel: "Neuen Ankündigungstext eingeben:",
    tickerPlaceholder: "Schreiben Sie hier Ihr Angebot oder Ihre Ankündigung...",
    saveTickerBtn: "Neuen Lauftext speichern",
    resetTickerBtn: "Standard-Lauftext wiederherstellen",
    headerSubtitleTitle: "Kopfzeilen-Text steuern (Header Subtitle)",
    headerSubtitleInstruction: "Dieser Text wird oben rechts in der Kopfzeile aller Bildschirme angezeigt:",
    headerSubtitleInputLabel: "Neuen Kopfzeilen-Text eingeben:",
    saveSubtitleBtn: "Kopfzeilen-Text speichern",
    resetSubtitleBtn: "Standard-Kopfzeilen-Text wiederherstellen",
    logoControlTitle: "Geschäftslogo ändern (HANDYLAND Logo)",
    currentLogoLabel: "Aktuelles Geschäftslogo:",
    selectLogoPrompt: "Neues Logo-Bild auswählen",
    saveLogoBtn: "Neues Logo speichern",
    resetLogoBtn: "Standard-Logo wiederherstellen",
    screenTimersTitle: "Timer pro Bildschirm (in Sekunden)",
    screenTimersInstruction: "Geben Sie für jeden Bildschirm die Anzeigedauer pro Plakat selbst ein:",
    timerScreen1Label: "Bildschirm 1 (Smartphones):",
    timerScreen2Label: "Bildschirm 2 (Reparatur):",
    timerScreen3Label: "Bildschirm 3 (Angebote):",
    saveTimersBtn: "Alle Timer speichern",
    pinProtectionTitle: "PIN-Schutz für Verwaltungskonsole",
    pinInputLabel: "Neuen 4-stelligen PIN-Code eingeben:",
    savePinBtn: "PIN-Code speichern",
    enterPinPrompt: "Bitte geben Sie den PIN-Code ein, um auf die Verwaltungskonsole zuzugreifen:",
    wrongPin: "Falscher PIN-Code! Zugriff verweigert.",
    weatherCityTitle: "Stadt für Live-Wetter-Widget",
    weatherCityLabel: "Stadtname für Live-Temperatur (z. B. Heidelberg, Frankfurt):",
    saveCityBtn: "Stadt speichern",
    confirmResetLogo: "Möchten Sie das Logo wirklich auf das Standard-HANDYLAND-Logo zurücksetzen?",
    confirmResetTicker: "Möchten Sie den Lauftext wirklich auf den Standardtext zurücksetzen?",
    confirmResetSubtitle: "Möchten Sie den Kopfzeilen-Text wirklich auf den Standardtext zurücksetzen?",
    imageTooLarge: "Das Bild ist zu groß. Bitte wählen Sie ein Bild unter 3 MB.",
    logoTooLarge: "Das Logo ist zu groß. Bitte wählen Sie ein Bild unter 2 MB.",
    selectImageFirst: "Bitte wählen Sie zuerst ein Bild aus.",
    uploadSuccess: "Erfolgreich hochgeladen!",
    uploadError: "Fehler beim Hochladen des Bildes.",
    saveSuccess: "Erfolgreich gespeichert!",
    resetSuccess: "Erfolgreich zurückgesetzt!",
  },
  ar: {
    systemTitle: "نظام التحكم بالشاشات المصورة والخبر المتحرك",
    adminTitle: "لوحة تحكم شاشات HANDYLAND",
    backToMenu: "القائمة الرئيسية",
    returnToMenuBtn: "العودة للقائمة",
    screen1Title: "شاشة 1",
    screen1Sub: "Smartphones (بوسترات)",
    screen2Title: "شاشة 2",
    screen2Sub: "Reparatur (بوسترات + القائمة)",
    screen3Title: "شاشة 3",
    screen3Sub: "Angebote (بوسترات العروض)",
    adminBtnTitle: "لوحة التحكم",
    adminBtnSub: "إدارة الشاشات والأخبار والشعار",
    tabDevices: "شاشة الأجهزة (1)",
    tabRepairs: "شاشة الصيانة (2)",
    tabOffers: "شاشة العروض (3)",
    tabSettings: "الإعدادات (المؤقتات، PIN والطقس)",
    uploadTitle: "رفع بوستر/صورة لـ",
    selectImagePrompt: "اضغط هنا لاختيار صورة البوستر",
    noCropNote: "(تظهر الصورة بالكامل 100% بدون أي قص)",
    changeImage: "تغيير الصورة",
    uploadBtn: "رفع البوستر للشاشة",
    uploading: "جاري الرفع...",
    displayedPosters: "البوسترات المعروضة على",
    noPosters: "لا توجد بوسترات مرفوعة لهذه الشاشة حالياً.",
    posterLabel: "بوستر",
    deletePosterTooltip: "حذف البوستر",
    tickerControlTitle: "التحكم بالنص الإخباري المتحرك (Ticker)",
    tickerInstruction: "هذا النص يتحرك بشكل مباشر وشغّال في أسفل الشاشة 3 (شاشة العروض):",
    tickerInputLabel: "اكتب الخبر أو الإعلان هنا:",
    tickerPlaceholder: "اكتب الخبر باللغة الألمانية أو العربية...",
    saveTickerBtn: "حفظ النص الجديد للأخبار",
    resetTickerBtn: "استعادة النص الإخباري الافتراضي",
    headerSubtitleTitle: "التحكم بالنص الفرعي للهيدر العلوي",
    headerSubtitleInstruction: "هذا النص يظهر في أعلى يمين الهيدر بجميع الشاشات:",
    headerSubtitleInputLabel: "اكتب نص الهيدر الفرعي الجديد:",
    saveSubtitleBtn: "حفظ نص الهيدر الجديد",
    resetSubtitleBtn: "استعادة نص الهيدر الافتراضي",
    logoControlTitle: "تغيير شعار المحل (HANDYLAND Logo)",
    currentLogoLabel: "الشعار الحالي المعروض على الشاشات:",
    selectLogoPrompt: "اختيار صورة شعار جديدة",
    saveLogoBtn: "حفظ الشعار الجديد",
    resetLogoBtn: "استعادة الشعار الافتراضي",
    screenTimersTitle: "مؤقت التقليب الخاص لكل شاشة (بالثواني)",
    screenTimersInstruction: "ادخل عدد ثواني عرض البوستر المفضل لكل شاشة بشكل مستقل:",
    timerScreen1Label: "مؤقت شاشة 1 (الأجهزة):",
    timerScreen2Label: "مؤقت شاشة 2 (الصيانة):",
    timerScreen3Label: "مؤقت شاشة 3 (العروض):",
    saveTimersBtn: "حفظ مؤقتات الشاشات",
    pinProtectionTitle: "حماية لوحة التحكم برمز سر (PIN)",
    pinInputLabel: "اكتب رمز PIN الجديد (من 4 أرقام):",
    savePinBtn: "حفظ رمز PIN",
    enterPinPrompt: "يرجى كتابة رمز PIN للدخول إلى لوحة التحكم:",
    wrongPin: "رمز PIN غير صحيح! تم رفض الدخول.",
    weatherCityTitle: "المدينة لودجت الطقس المباشر",
    weatherCityLabel: "اسم المدينة لجلب الحرارة الحقيقية (مثل هايدلبرغ Heidelberg):",
    saveCityBtn: "حفظ المدينة",
    confirmResetLogo: "هل أنت تأكد من إرجاع الشعار إلى الشعار الأساسي الافتراضي لـ HANDYLAND؟",
    confirmResetTicker: "هل أنت تأكد من استعادة نص الشريط الإخباري الافتراضي؟",
    confirmResetSubtitle: "هل أنت تأكد من استعادة نص الهيدر الافتراضي؟",
    imageTooLarge: "حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 3 ميجابايت.",
    logoTooLarge: "حجم الشعار كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت.",
    selectImageFirst: "يرجى اختيار صورة أولاً.",
    uploadSuccess: "تم الرفع بنجاح!",
    uploadError: "حدث خطأ أثناء رفع الصورة.",
    saveSuccess: "تم الحفظ بنجاح!",
    resetSuccess: "تمت الاستعادة بنجاح!",
  }
};

// --- ودجت الطقس والساعة المباشرة مع جلب الحرارة الحقيقية لحظياً عبر Open-Meteo API ---
const LiveClockWeatherWidget = ({ cityName = 'Heidelberg', lang }) => {
  const [time, setTime] = useState(new Date());
  const [temp, setTemp] = useState(null);
  const [weatherCode, setWeatherCode] = useState(0);

  // 1. تحديث الساعة بالثواني
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. جلب حالة الطقس الحقيقية من API لمدينة المحل (Heidelberg)
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const targetCity = cityName.trim() || 'Heidelberg';
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetCity)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (geoData?.results?.[0]) {
          const { latitude, longitude } = geoData.results[0];
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          
          if (weatherData?.current_weather && isMounted) {
            setTemp(Math.round(weatherData.current_weather.temperature));
            setWeatherCode(weatherData.current_weather.weathercode);
          }
        }
      } catch (err) {
        console.warn("Weather API notice:", err);
      }
    };

    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 900000); // تحديث كل 15 دقيقة
    return () => { isMounted = false; clearInterval(weatherTimer); };
  }, [cityName]);

  const timeStr = time.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'de-DE', { weekday: 'short', day: 'numeric', month: 'short' });

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="w-5 h-5 text-yellow-400 animate-spin-slow" />;
    if (code >= 1 && code <= 3) return <CloudSun className="w-5 h-5 text-yellow-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (code >= 71 && code <= 86) return <Snowflake className="w-5 h-5 text-cyan-300" />;
    if (code >= 95) return <CloudLightning className="w-5 h-5 text-yellow-500" />;
    return <CloudSun className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div className="flex items-center gap-3 bg-black/60 px-4 py-1.5 rounded-2xl border border-yellow-500/30 text-yellow-400 font-bold backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-2 border-r border-yellow-500/20 pr-3">
        <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
        <div className="flex flex-col text-right leading-none">
          <span className="text-base font-black tracking-wider text-white">{timeStr}</span>
          <span className="text-[10px] text-yellow-400/80 uppercase">{dateStr}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 pl-1">
        {getWeatherIcon(weatherCode)}
        <span className="text-xs font-semibold text-gray-200">
          {cityName || 'Heidelberg'} {temp !== null ? `${temp}°C` : '...'}
        </span>
      </div>
    </div>
  );
};

// --- زر ملء الشاشة عائم شفاف للتلفاز ---
const TVScreenControls = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock Error:', err);
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <button 
      onClick={toggleFullscreen}
      className="fixed top-4 right-4 z-50 bg-black/40 hover:bg-yellow-500 hover:text-black text-yellow-400/80 hover:text-black p-2.5 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/60 backdrop-blur-md transition-all shadow-lg opacity-40 hover:opacity-100 group"
      title="Vollbild / Fullscreen"
    >
      {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6 group-hover:scale-110 transition-transform" />}
    </button>
  );
};

// --- زر تغيير اللغة الألمانية / العربية ---
const LanguageToggle = ({ lang, setLang }) => (
  <button 
    onClick={() => setLang(lang === 'de' ? 'ar' : 'de')}
    className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500 hover:text-black text-yellow-400 px-4 py-2 rounded-2xl border border-yellow-500/30 backdrop-blur-md transition-all shadow-md font-bold text-sm lg:text-base"
    title="Sprache wechseln / تغيير اللغة"
  >
    <Languages className="w-5 h-5" />
    <span>{lang === 'de' ? '🇩🇪 Deutsch' : '🇸🇦 العربية'}</span>
  </button>
);

// --- زر الرجوع الشفاف للتلفاز ---
const TVBackControl = ({ onBack, t }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'GoBack') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <button 
      onClick={onBack}
      className="fixed top-4 left-4 z-50 bg-black/40 hover:bg-yellow-500 hover:text-black text-yellow-400/90 hover:text-black p-2.5 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/60 backdrop-blur-md transition-all shadow-lg opacity-40 hover:opacity-100 group"
      title={t.returnToMenuBtn}
    >
      <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
    </button>
  );
};

// --- مكون الهيدر الموحد مع ودجت الساعة والطقس ---
const HandylandHeader = ({ title, icon: Icon, customLogo, headerSubtitle, cityName, lang }) => (
  <header className="absolute top-0 left-0 right-0 px-6 lg:px-10 py-3.5 bg-black/80 border-b border-yellow-500/30 flex justify-between items-center z-30 backdrop-blur-md pl-16 lg:pl-20 pr-24 lg:pr-32 shadow-2xl h-20 lg:h-24">
    <div className="flex items-center gap-4 lg:gap-6 z-10">
      <div className="flex items-center gap-3">
        {customLogo ? (
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 border-yellow-400 p-0.5 bg-white flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.6)]">
            <img src={customLogo} alt="HANDYLAND Logo" className="w-full h-full object-contain rounded-full" />
          </div>
        ) : (
          <Globe className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
        )}
        <span className={`text-3xl lg:text-5xl font-black tracking-widest ${goldTextGradient} drop-shadow-md`}>HANDYLAND</span>
      </div>
      <div className="h-10 w-0.5 bg-yellow-500/40"></div>
      <h1 className="text-lg lg:text-2xl font-extrabold text-white flex items-center gap-3 tracking-wide">
        {Icon && <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400" />}
        {title}
      </h1>
    </div>

    <div className="hidden sm:flex items-center gap-4">
      <LiveClockWeatherWidget cityName={cityName} lang={lang} />
      <div className="hidden lg:flex text-sm lg:text-lg text-yellow-400/90 font-semibold tracking-wider z-10 uppercase items-center gap-2.5 bg-yellow-500/10 px-5 py-2 rounded-xl border border-yellow-500/30">
        <span className="w-3 h-3 rounded-full bg-green-500 animate-ping"></span>
        {headerSubtitle || DEFAULT_SUBTITLE}
      </div>
    </div>
  </header>
);

// --- نافذة الحماية برمز PIN عند دخول لوحة التحكم ---
const PinProtectionModal = ({ onVerify, onClose, t, lang }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onVerify(pinInput);
    if (!success) {
      setErrorMsg(true);
      setPinInput('');
    }
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6" dir={dir}>
      <div className="max-w-md w-full bg-gray-900 border-2 border-yellow-500/50 rounded-3xl p-8 shadow-2xl text-white text-center relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white p-2 rounded-full">
          ✕
        </button>
        
        <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/30 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Lock className="w-10 h-10 text-yellow-400 animate-pulse" />
        </div>

        <h3 className="text-3xl font-black mb-2 text-yellow-400">{t.pinProtectionTitle}</h3>
        <p className="text-gray-300 text-sm mb-6">{t.enterPinPrompt}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="password" 
            maxLength={6}
            value={pinInput}
            onChange={(e) => { setPinInput(e.target.value); setErrorMsg(false); }}
            placeholder="••••"
            autoFocus
            className="w-full text-center text-4xl font-mono font-black tracking-widest py-4 bg-black border-2 border-yellow-500/60 rounded-2xl text-yellow-400 focus:outline-none focus:border-yellow-400 shadow-inner"
          />

          {errorMsg && (
            <p className="text-red-500 font-bold text-sm bg-red-500/10 py-2 rounded-xl border border-red-500/30">{t.wrongPin}</p>
          )}

          <button type="submit" className="w-full py-4 rounded-2xl text-2xl font-black bg-yellow-500 hover:bg-yellow-400 text-black shadow-xl transition active:scale-95">
            {t.adminBtnTitle}
          </button>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// الشاشة 1 والشاشة 3: عرض البوسترات مع معالجة الاختفاء المباشر عند الحذف
// ----------------------------------------------------------------------
const ImageSlideshowScreen = ({ items, title, icon, showNewsTicker = false, customLogo, tickerText, headerSubtitle, slideInterval = 6, cityName, onBack, t, lang }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // تحديث فوري للمؤشر إذا تم حذف صورة من القائمة
  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  useEffect(() => {
    if (items.length <= 1) return;
    const intervalMs = Math.max(2, parseInt(slideInterval) || 6) * 1000;
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % items.length), intervalMs);
    return () => clearInterval(timer);
  }, [items.length, slideInterval]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#050505] text-white font-sans relative overflow-hidden" dir="ltr">
        <TVScreenControls />
        <TVBackControl onBack={onBack} t={t} />
        <span className={`text-6xl lg:text-8xl font-black tracking-widest mb-6 ${goldTextGradient} animate-pulse`}>HANDYLAND</span>
        <div className="text-2xl lg:text-4xl text-gray-400 font-light bg-black/60 px-10 py-5 rounded-3xl border border-yellow-500/20 backdrop-blur-md">
          Warten auf Bilder... (Keine Plakate hochgeladen)
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen max-h-screen w-full ${darkBg} text-white overflow-hidden font-sans relative`} dir="ltr">
      <TVScreenControls />
      <TVBackControl onBack={onBack} t={t} />
      <HandylandHeader title={title} icon={icon} customLogo={customLogo} headerSubtitle={headerSubtitle} cityName={cityName} lang={lang} />

      <main className={`flex-1 relative bg-black flex items-center justify-center overflow-hidden w-full h-full min-h-0 pt-24 ${showNewsTicker ? 'pb-16' : 'pb-4'}`}>
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className={`absolute inset-0 transition-all duration-1000 transform flex items-center justify-center w-full h-full p-2 lg:p-4 ${
              index === (currentIndex % items.length) ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'
            }`}
          >
             {item.imageData ? (
               <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={item.imageData} 
                    alt="Ambient Blur" 
                    className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-60 scale-125 pointer-events-none" 
                  />
                  <img 
                    src={item.imageData} 
                    alt="Poster" 
                    className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] rounded-xl" 
                  />
               </div>
             ) : (
               <div className="text-4xl text-red-500 font-bold">Bildfehler</div>
             )}
          </div>
        ))}

        <div className={`absolute ${showNewsTicker ? 'bottom-20' : 'bottom-6'} left-0 right-0 z-30 flex justify-center gap-4`}>
          {items.map((_, index) => (
             <div 
               key={index} 
               className={`h-3 rounded-full transition-all duration-500 shadow-2xl border border-black/40 ${
                 index === (currentIndex % items.length) ? 'w-20 bg-yellow-400 shadow-[0_0_15px_#facc15]' : 'w-5 bg-gray-900/80'
               }`} 
             />
          ))}
        </div>
      </main>
      
      <div className="h-1.5 w-full bg-gray-950 absolute top-0 z-40">
        <div 
          className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 transition-all duration-1000 ease-linear shadow-[0_0_10px_#facc15]" 
          style={{ width: `${(((currentIndex % items.length) + 1) / items.length) * 100}%` }} 
        />
      </div>

      {showNewsTicker && (
        <footer className="w-full bg-yellow-400 text-black py-3.5 shadow-2xl z-30 flex border-t-4 border-yellow-500 overflow-hidden relative">
          <div className="flex items-center px-8 bg-yellow-500 z-40 font-black text-2xl lg:text-3xl gap-4 whitespace-nowrap border-r-4 border-yellow-600 shadow-xl tracking-wider">
            <Info className="w-8 h-8 animate-pulse" />
            HANDYLAND NEWS
          </div>
          <div className="flex-1 relative overflow-hidden flex items-center">
            <p className="absolute whitespace-nowrap text-3xl lg:text-4xl font-black animate-marquee w-full text-left tracking-wider">
              {tickerText || DEFAULT_TICKER}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};


// ----------------------------------------------------------------------
// الشاشة 2: شاشة الصيانة مع معالجة الاختفاء المباشر عند الحذف
// ----------------------------------------------------------------------
const ScreenRepairs = ({ repairs, customLogo, headerSubtitle, slideInterval = 6, cityName, onBack, t, lang }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // تحديث فوري للمؤشر إذا تم حذف صورة صيانة
  useEffect(() => {
    if (currentIndex >= repairs.length && repairs.length > 0) {
      setCurrentIndex(0);
    }
  }, [repairs.length, currentIndex]);

  useEffect(() => {
    if (repairs.length <= 1) return;
    const intervalMs = Math.max(2, parseInt(slideInterval) || 6) * 1000;
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % repairs.length), intervalMs);
    return () => clearInterval(timer);
  }, [repairs.length, slideInterval]);

  return (
    <div className={`flex flex-col h-screen max-h-screen w-full ${darkBg} text-white overflow-hidden font-sans relative`} dir="ltr">
      <TVScreenControls />
      <TVBackControl onBack={onBack} t={t} />
      <HandylandHeader title="Reparaturzentrum & Preise" icon={Wrench} customLogo={customLogo} headerSubtitle={headerSubtitle} cityName={cityName} lang={lang} />

      <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col relative min-h-0 pt-24 lg:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full z-10 min-h-0">
          
          <div className="lg:col-span-4 flex flex-col justify-between bg-gradient-to-b from-black/95 via-gray-950/90 to-black/95 rounded-3xl border-2 border-yellow-500/40 p-6 lg:p-8 shadow-2xl backdrop-blur-xl h-full min-h-0 overflow-hidden">
            
            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative mb-4 p-1.5 bg-white rounded-full border-4 border-yellow-400 shadow-[0_0_35px_rgba(234,179,8,0.5)] flex items-center justify-center w-36 h-36 lg:w-48 lg:h-48 overflow-hidden">
                 {customLogo ? (
                   <img src={customLogo} alt="Shop Logo" className="w-full h-full object-contain rounded-full p-1" />
                 ) : (
                   <div className="relative w-full h-full flex items-center justify-center bg-black rounded-full">
                     <Smartphone className="w-20 h-20 lg:w-24 lg:h-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                     <Wrench className="w-20 h-20 lg:w-24 lg:h-24 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] absolute" />
                   </div>
                 )}
              </div>

              <h2 className={`text-3xl lg:text-4xl font-black text-center leading-tight mb-2 ${goldTextGradient} tracking-wide`}>
                Schnell &<br/>Professionell
              </h2>
              <p className="text-yellow-400/80 text-sm lg:text-base font-semibold tracking-wider uppercase">Vor-Ort Express Reparatur</p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:gap-5 text-gray-100 text-base lg:text-lg font-extrabold w-full my-auto">
              <div className="flex flex-col items-center justify-center gap-2.5 bg-black/80 hover:bg-yellow-500/10 transition-colors p-4 lg:p-5 rounded-3xl border border-yellow-500/30 shadow-lg text-center">
                <Battery className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-400 drop-shadow-md"/>
                <span>Akkus</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2.5 bg-black/80 hover:bg-yellow-500/10 transition-colors p-4 lg:p-5 rounded-3xl border border-yellow-500/30 shadow-lg text-center">
                <Smartphone className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-400 drop-shadow-md"/>
                <span>Displays</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2.5 bg-black/80 hover:bg-yellow-500/10 transition-colors p-4 lg:p-5 rounded-3xl border border-yellow-500/30 shadow-lg text-center">
                <Cpu className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-400 drop-shadow-md"/>
                <span>Platinen</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-2.5 bg-black/80 hover:bg-yellow-500/10 transition-colors p-4 lg:p-5 rounded-3xl border border-yellow-500/30 shadow-lg text-center">
                <Zap className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-400 drop-shadow-md"/>
                <span>Ladebuchsen</span>
              </div>
            </div>

          </div>

          <div className="lg:col-span-8 bg-black/80 rounded-3xl border-2 border-yellow-500/30 p-3 lg:p-4 flex flex-col h-full overflow-hidden shadow-2xl backdrop-blur-xl min-h-0 relative justify-center items-center">
            {repairs.length === 0 ? (
              <div className="text-3xl text-gray-400 font-light">Warten auf Reparatur-Plakat...</div>
            ) : (
              repairs.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`absolute inset-0 transition-all duration-1000 transform flex items-center justify-center p-2 ${
                    index === (currentIndex % repairs.length) ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'
                  }`}
                >
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                    <img 
                      src={item.imageData} 
                      alt="Ambient Blur" 
                      className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-50 scale-125 pointer-events-none" 
                    />
                    <img 
                      src={item.imageData} 
                      alt="Repair Poster" 
                      className="relative z-10 max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                    />
                  </div>
                </div>
              ))
            )}

            {repairs.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-3">
                {repairs.map((_, index) => (
                   <div 
                     key={index} 
                     className={`h-2.5 rounded-full transition-all duration-500 shadow-xl ${
                       index === (currentIndex % repairs.length) ? 'w-16 bg-yellow-400' : 'w-4 bg-gray-800'
                     }`} 
                   />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};


// ----------------------------------------------------------------------
// لوحة التحكم المتقدمة
// ----------------------------------------------------------------------
const AdminPanel = ({ 
  devices, repairs, offers, customLogo, tickerText, headerSubtitle, 
  intervalScreen1, intervalScreen2, intervalScreen3, adminPin, cityName,
  onBack, onRefresh, lang, setLang, t 
}) => {
  const [activeTab, setActiveTab] = useState('devices');
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [editableTicker, setEditableTicker] = useState(tickerText || DEFAULT_TICKER);
  const [editableSubtitle, setEditableSubtitle] = useState(headerSubtitle || DEFAULT_SUBTITLE);
  const [editableTimer1, setEditableTimer1] = useState(intervalScreen1 || 6);
  const [editableTimer2, setEditableTimer2] = useState(intervalScreen2 || 6);
  const [editableTimer3, setEditableTimer3] = useState(intervalScreen3 || 6);
  const [editablePin, setEditablePin] = useState(adminPin || DEFAULT_PIN);
  const [editableCity, setEditableCity] = useState(cityName || 'Heidelberg');

  useEffect(() => { setEditableTicker(tickerText || DEFAULT_TICKER); }, [tickerText]);
  useEffect(() => { setEditableSubtitle(headerSubtitle || DEFAULT_SUBTITLE); }, [headerSubtitle]);
  useEffect(() => { setEditableTimer1(intervalScreen1 || 6); }, [intervalScreen1]);
  useEffect(() => { setEditableTimer2(intervalScreen2 || 6); }, [intervalScreen2]);
  useEffect(() => { setEditableTimer3(intervalScreen3 || 6); }, [intervalScreen3]);
  useEffect(() => { setEditablePin(adminPin || DEFAULT_PIN); }, [adminPin]);
  useEffect(() => { setEditableCity(cityName || 'Heidelberg'); }, [cityName]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3145728) {
        alert(t.imageTooLarge);
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2097152) {
        alert(t.logoTooLarge);
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async (e, tableName) => {
    e.preventDefault();
    if (!imageFile) {
      alert(t.selectImageFirst);
      return;
    }
    setLoading(true);
    try {
      const base64Image = await convertToBase64(imageFile);
      const { error } = await supabase.from(tableName).insert([{ imageData: base64Image }]);
      if (error) throw error;
      
      setImageFile(null);
      setImagePreview(null);
      const fileInput = document.getElementById('posterUpload');
      if (fileInput) fileInput.value = '';
      onRefresh();
      alert(t.uploadSuccess);
    } catch (err) { 
      console.error(err); 
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleSaveLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) return;
    setLoading(true);
    try {
      const base64Logo = await convertToBase64(logoFile);
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', logoData: base64Logo });
      if (error) throw error;
      setLogoFile(null);
      setLogoPreview(null);
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleResetToDefaultLogo = async () => {
    if (!window.confirm(t.confirmResetLogo)) return;
    setLoading(true);
    try {
      await supabase.from('shop_settings').update({ logoData: null }).eq('id', 'config');
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTicker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', tickerText: editableTicker });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleResetTicker = async () => {
    if (!window.confirm(t.confirmResetTicker)) return;
    setLoading(true);
    try {
      await supabase.from('shop_settings').upsert({ id: 'config', tickerText: DEFAULT_TICKER });
      setEditableTicker(DEFAULT_TICKER);
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveSubtitle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', headerSubtitle: editableSubtitle });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(t.uploadError);
    }
    setLoading(false);
  };

  const handleResetSubtitle = async () => {
    if (!window.confirm(t.confirmResetSubtitle)) return;
    setLoading(true);
    try {
      await supabase.from('shop_settings').upsert({ id: 'config', headerSubtitle: DEFAULT_SUBTITLE });
      setEditableSubtitle(DEFAULT_SUBTITLE);
      alert(t.resetSuccess);
      onRefresh();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSaveTimers = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('shop_settings').upsert({ 
        id: 'config', 
        intervalScreen1: parseInt(editableTimer1) || 6,
        intervalScreen2: parseInt(editableTimer2) || 6,
        intervalScreen3: parseInt(editableTimer3) || 6
      });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) { console.error(err); alert(t.uploadError); }
    setLoading(false);
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!editablePin || editablePin.length < 4) {
      alert("PIN required (4+ digits)");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', adminPin: editablePin });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) { console.error(err); alert(t.uploadError); }
    setLoading(false);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('shop_settings').upsert({ id: 'config', cityName: editableCity });
      if (error) throw error;
      alert(t.saveSuccess);
      onRefresh();
    } catch (err) { console.error(err); alert(t.uploadError); }
    setLoading(false);
  };

  const handleDelete = async (tableName, id) => {
    try { 
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err) { console.error(err); }
  };

  const getTabInfo = () => {
    if (activeTab === 'devices') return { name: t.tabDevices, table: 'shop_devices', items: devices };
    if (activeTab === 'repairs') return { name: t.tabRepairs, table: 'shop_repairs', items: repairs };
    if (activeTab === 'offers') return { name: t.tabOffers, table: 'shop_offers', items: offers };
    return { name: t.tabSettings, table: 'shop_settings', items: [] };
  };

  const currentTab = getTabInfo();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 font-sans" dir={dir}>
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        <div className="bg-black text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <Settings className="w-10 h-10 text-yellow-500" />
            <h2 className="text-2xl md:text-3xl font-black text-yellow-500">
              {t.adminTitle}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle lang={lang} setLang={setLang} />
            <button onClick={onBack} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-6 py-3.5 rounded-2xl transition text-lg font-bold text-yellow-400 border border-gray-700">
              {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              {t.returnToMenuBtn}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row border-b border-gray-200">
          <button onClick={() => { setActiveTab('devices'); setImageFile(null); setImagePreview(null); }} className={`flex-1 py-5 text-lg font-bold flex justify-center items-center gap-3 transition ${activeTab === 'devices' ? 'bg-yellow-50 border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Smartphone className="w-6 h-6" /> {t.tabDevices}
          </button>
          <button onClick={() => { setActiveTab('repairs'); setImageFile(null); setImagePreview(null); }} className={`flex-1 py-5 text-lg font-bold flex justify-center items-center gap-3 transition ${activeTab === 'repairs' ? 'bg-yellow-50 border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Wrench className="w-6 h-6" /> {t.tabRepairs}
          </button>
          <button onClick={() => { setActiveTab('offers'); setImageFile(null); setImagePreview(null); }} className={`flex-1 py-5 text-lg font-bold flex justify-center items-center gap-3 transition ${activeTab === 'offers' ? 'bg-yellow-50 border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Tag className="w-6 h-6" /> {t.tabOffers}
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-5 text-lg font-bold flex justify-center items-center gap-3 transition ${activeTab === 'settings' ? 'bg-yellow-50 border-b-4 border-yellow-500 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Globe className="w-6 h-6" /> {t.tabSettings}
          </button>
        </div>

        <div className="p-8 md:p-10">
          {activeTab !== 'settings' ? (
            <div className="grid lg:grid-cols-5 gap-12">
              
              <div className="lg:col-span-2 bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm h-fit">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">{t.uploadTitle} {currentTab.name}</h3>
                <form onSubmit={(e) => handleUploadImage(e, currentTab.table)} className="space-y-6">
                  <div className="border-3 border-dashed border-yellow-500 bg-yellow-50/50 p-8 rounded-3xl text-center relative hover:bg-yellow-50 transition cursor-pointer">
                    <input 
                      type="file" 
                      id="posterUpload"
                      accept="image/*" 
                      onChange={handleImageSelect} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    {!imagePreview ? (
                      <div className="flex flex-col items-center pointer-events-none">
                        <ImageIcon className="w-16 h-16 text-yellow-600 mb-4" />
                        <p className="font-extrabold text-xl text-gray-800">{t.selectImagePrompt}</p>
                        <p className="text-sm text-gray-500 mt-2">{t.noCropNote}</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="max-h-56 mx-auto rounded-xl shadow-md object-contain" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/60 transition rounded-xl pointer-events-none">
                          <p className="text-white font-bold text-lg">{t.changeImage}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading || !imageFile} 
                    className={`w-full py-5 rounded-2xl text-2xl font-black flex justify-center items-center gap-3 shadow-xl transition-transform active:scale-95 border border-yellow-500/50 ${loading || !imageFile ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-yellow-400 hover:bg-gray-900'}`}
                  >
                    {loading ? t.uploading : <><Plus className="w-7 h-7" /> {t.uploadBtn}</>}
                  </button>
                </form>
              </div>
              
              <div className="lg:col-span-3">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">{t.displayedPosters} {currentTab.name} ({currentTab.items.length})</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2">
                  {currentTab.items.length === 0 && <p className="text-gray-500 text-xl col-span-3 text-center py-16 bg-gray-50 rounded-2xl border">{t.noPosters}</p>}
                  
                  {currentTab.items.map((item, index) => (
                    <div key={item.id} className="bg-white border-2 border-gray-200 p-3 rounded-2xl flex flex-col justify-between shadow-sm hover:border-yellow-400 transition relative group h-56">
                      <div className="absolute top-3 right-3 bg-black/80 text-yellow-400 px-3 py-1 rounded-lg text-sm font-bold z-10">
                        {t.posterLabel} {index + 1}
                      </div>
                      <button 
                        onClick={() => handleDelete(currentTab.table, item.id)} 
                        className="absolute top-3 left-3 text-white bg-red-600 hover:bg-red-700 p-3 rounded-xl transition z-10 opacity-0 group-hover:opacity-100 shadow-md"
                        title={t.deletePosterTooltip}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      <div className="w-full h-full bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                        {item.imageData ? (
                          <img src={item.imageData} alt={`Slide ${index}`} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-gray-400">Bildfehler</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* تبويب الإعدادات المتقدمة */
            <div className="space-y-10">
              
              {/* قسم مؤقتات الشاشات المنفصلة */}
              <div className="bg-gray-50 p-8 rounded-3xl border-2 border-yellow-500/40 shadow-sm">
                <h3 className="text-2xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-3">
                  <Timer className="w-8 h-8 text-yellow-600" />
                  {t.screenTimersTitle}
                </h3>
                <p className="text-gray-600 text-sm mb-6 font-semibold">{t.screenTimersInstruction}</p>

                <form onSubmit={handleSaveTimers} className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-yellow-600" /> {t.timerScreen1Label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min={2}
                          max={120}
                          value={editableTimer1}
                          onChange={(e) => setEditableTimer1(e.target.value)}
                          className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-2xl font-black text-center text-gray-900 bg-yellow-50/50"
                        />
                        <span className="font-bold text-gray-500">{lang === 'ar' ? 'ثانية' : 'Sek'}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-yellow-600" /> {t.timerScreen2Label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min={2}
                          max={120}
                          value={editableTimer2}
                          onChange={(e) => setEditableTimer2(e.target.value)}
                          className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-2xl font-black text-center text-gray-900 bg-yellow-50/50"
                        />
                        <span className="font-bold text-gray-500">{lang === 'ar' ? 'ثانية' : 'Sek'}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-yellow-600" /> {t.timerScreen3Label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min={2}
                          max={120}
                          value={editableTimer3}
                          onChange={(e) => setEditableTimer3(e.target.value)}
                          className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-2xl font-black text-center text-gray-900 bg-yellow-50/50"
                        />
                        <span className="font-bold text-gray-500">{lang === 'ar' ? 'ثانية' : 'Sek'}</span>
                      </div>
                    </div>

                  </div>

                  <button type="submit" className="w-full py-4 bg-black text-yellow-400 font-black text-xl rounded-2xl hover:bg-gray-900 shadow-lg flex justify-center items-center gap-2">
                    <Save className="w-6 h-6" /> {t.saveTimersBtn}
                  </button>
                </form>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* 2. حماية PIN */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Key className="w-6 h-6 text-yellow-600" />
                      {t.pinProtectionTitle}
                    </h4>
                    <p className="text-gray-600 text-xs mb-3 font-semibold">{t.pinInputLabel}</p>
                    <form onSubmit={handleSavePin} className="space-y-3">
                      <input 
                        type="text"
                        maxLength={6}
                        value={editablePin}
                        onChange={(e) => setEditablePin(e.target.value)}
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-xl font-mono font-bold text-center text-gray-900 bg-white"
                        dir="ltr"
                      />
                      <button type="submit" className="w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900">
                        {t.savePinBtn}
                      </button>
                    </form>
                  </div>
                </div>

                {/* 3. ودجت مدينة الطقس المباشر */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <CloudSun className="w-6 h-6 text-yellow-600" />
                      {t.weatherCityTitle}
                    </h4>
                    <p className="text-gray-600 text-xs mb-3 font-semibold">{t.weatherCityLabel}</p>
                    <form onSubmit={handleSaveCity} className="space-y-3">
                      <input 
                        type="text"
                        value={editableCity}
                        onChange={(e) => setEditableCity(e.target.value)}
                        placeholder="Heidelberg, Frankfurt, Berlin..."
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-lg font-bold text-gray-900 bg-white"
                        dir="ltr"
                      />
                      <button type="submit" className="w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900">
                        {t.saveCityBtn}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* 4. التحكم بنص الهيدر الفرعي */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Layout className="w-6 h-6 text-yellow-600" />
                      {t.headerSubtitleTitle}
                    </h3>
                    
                    <div className="bg-black text-yellow-400 p-3 rounded-xl mb-4 font-bold text-center border border-yellow-500/40 text-sm">
                      <span>{editableSubtitle}</span>
                    </div>

                    <form onSubmit={handleSaveSubtitle} className="space-y-3">
                      <input 
                        type="text"
                        value={editableSubtitle}
                        onChange={(e) => setEditableSubtitle(e.target.value)}
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-base font-bold text-gray-900 bg-white"
                        dir="ltr"
                      />
                      <button type="submit" className="w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 flex justify-center items-center gap-2">
                        <Save className="w-5 h-5" /> {t.saveSubtitleBtn}
                      </button>
                    </form>
                  </div>

                  <button onClick={handleResetSubtitle} className="mt-4 text-xs font-bold text-gray-500 hover:text-gray-800 underline text-center">
                    {t.resetSubtitleBtn}
                  </button>
                </div>

                {/* 5. التحكم بالشريط الإخباري المتحرك */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Type className="w-6 h-6 text-yellow-600" />
                      {t.tickerControlTitle}
                    </h3>
                    
                    <div className="bg-yellow-400 text-black py-2 px-3 rounded-xl mb-4 font-black text-xs overflow-hidden border border-yellow-500 flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <div className="overflow-hidden whitespace-nowrap flex-1">
                        <span className="inline-block animate-marquee">{editableTicker}</span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveTicker} className="space-y-3">
                      <textarea 
                        rows={3}
                        value={editableTicker}
                        onChange={(e) => setEditableTicker(e.target.value)}
                        className="w-full p-3 border-2 border-yellow-500/60 rounded-xl text-base font-bold text-gray-900 bg-white"
                        dir="ltr"
                      />
                      <button type="submit" className="w-full py-3 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-900 flex justify-center items-center gap-2">
                        <Save className="w-5 h-5" /> {t.saveTickerBtn}
                      </button>
                    </form>
                  </div>

                  <button onClick={handleResetTicker} className="mt-4 text-xs font-bold text-gray-500 hover:text-gray-800 underline text-center">
                    {t.resetTickerBtn}
                  </button>
                </div>

                {/* 6. التحكم بشعار المحل */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black mb-3 text-gray-800 border-b pb-3 flex items-center gap-2">
                      <Globe className="w-6 h-6 text-yellow-600" />
                      {t.logoControlTitle}
                    </h3>
                    
                    <div className="mb-4 text-center">
                      <div className="bg-white p-1 rounded-full inline-flex items-center justify-center border-2 border-yellow-400 shadow-md w-24 h-24 overflow-hidden">
                        {customLogo ? (
                          <img src={customLogo} alt="Current Logo" className="w-full h-full object-contain rounded-full p-1" />
                        ) : (
                          <div className="relative w-full h-full flex items-center justify-center bg-black rounded-full">
                            <Smartphone className="w-10 h-10 text-yellow-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSaveLogo} className="space-y-3">
                      <div className="border-2 border-dashed border-yellow-500 bg-yellow-50/50 p-3 rounded-xl text-center relative hover:bg-yellow-50 transition cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleLogoSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <p className="font-bold text-xs text-gray-800">{t.selectLogoPrompt}</p>
                      </div>
                      <button type="submit" disabled={loading || !logoFile} className={`w-full py-3 rounded-xl text-base font-bold border ${loading || !logoFile ? 'bg-gray-300 text-gray-500' : 'bg-black text-yellow-400 hover:bg-gray-900'}`}>
                        {t.saveLogoBtn}
                      </button>
                    </form>
                  </div>

                  {customLogo && (
                    <button onClick={handleResetToDefaultLogo} className="mt-4 text-xs font-bold text-red-600 hover:text-red-800 underline text-center">
                      {t.resetLogoBtn}
                    </button>
                  )}
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// التطبيق الرئيسي
// ----------------------------------------------------------------------
export default function App() {
  const [view, setView] = useState('menu');
  const [lang, setLang] = useState(() => localStorage.getItem('handyland_lang') || 'de');
  const [showPinModal, setShowPinModal] = useState(false);
  
  const [devices, setDevices] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [offers, setOffers] = useState([]);
  const [customLogo, setCustomLogo] = useState(null);
  const [tickerText, setTickerText] = useState(DEFAULT_TICKER);
  const [headerSubtitle, setHeaderSubtitle] = useState(DEFAULT_SUBTITLE);
  
  const [intervalScreen1, setIntervalScreen1] = useState(6);
  const [intervalScreen2, setIntervalScreen2] = useState(6);
  const [intervalScreen3, setIntervalScreen3] = useState(6);

  const [adminPin, setAdminPin] = useState(DEFAULT_PIN);
  const [cityName, setCityName] = useState('Heidelberg');

  const t = translations[lang] || translations.de;

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('handyland_lang', newLang);
  };

  const fetchAllData = async () => {
    try {
      const { data: devData } = await supabase.from('shop_devices').select('*').order('created_at', { ascending: false });
      if (devData) setDevices(devData);

      const { data: repData } = await supabase.from('shop_repairs').select('*').order('created_at', { ascending: false });
      if (repData) setRepairs(repData);

      const { data: offData } = await supabase.from('shop_offers').select('*').order('created_at', { ascending: false });
      if (offData) setOffers(offData);

      const { data: settingsData } = await supabase.from('shop_settings').select('*').eq('id', 'config').single();
      if (settingsData) {
        if (settingsData.logoData) setCustomLogo(settingsData.logoData);
        else setCustomLogo(null);

        if (settingsData.tickerText) setTickerText(settingsData.tickerText);
        else setTickerText(DEFAULT_TICKER);

        if (settingsData.headerSubtitle) setHeaderSubtitle(settingsData.headerSubtitle);
        else setHeaderSubtitle(DEFAULT_SUBTITLE);

        if (settingsData.intervalScreen1) setIntervalScreen1(settingsData.intervalScreen1);
        if (settingsData.intervalScreen2) setIntervalScreen2(settingsData.intervalScreen2);
        if (settingsData.intervalScreen3) setIntervalScreen3(settingsData.intervalScreen3);

        if (settingsData.adminPin) setAdminPin(settingsData.adminPin);
        if (settingsData.cityName) setCityName(settingsData.cityName);
        else setCityName('Heidelberg');
      }
    } catch (err) {
      console.warn("Supabase fetch notice:", err);
    }
  };

  useEffect(() => {
    fetchAllData();

    const channel = supabase
      .channel('public:handyland_tv_65_v22')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_devices' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_repairs' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_offers' }, fetchAllData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_settings' }, fetchAllData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenAdmin = () => {
    setShowPinModal(true);
  };

  const handleVerifyPin = (inputPin) => {
    if (inputPin === (adminPin || DEFAULT_PIN)) {
      setShowPinModal(false);
      setView('admin');
      return true;
    }
    return false;
  };

  if (view === 'admin') return (
    <AdminPanel 
      devices={devices} repairs={repairs} offers={offers} customLogo={customLogo} tickerText={tickerText} 
      headerSubtitle={headerSubtitle} intervalScreen1={intervalScreen1} intervalScreen2={intervalScreen2} intervalScreen3={intervalScreen3}
      adminPin={adminPin} cityName={cityName}
      onBack={() => setView('menu')} onRefresh={fetchAllData} lang={lang} setLang={handleSetLang} t={t} 
    />
  );

  if (view === 'screen1') return <ImageSlideshowScreen items={devices} title="Top Angebote & Smartphones" icon={Smartphone} customLogo={customLogo} tickerText={tickerText} headerSubtitle={headerSubtitle} slideInterval={intervalScreen1} cityName={cityName} onBack={() => setView('menu')} t={t} lang={lang} />;
  if (view === 'screen2') return <ScreenRepairs repairs={repairs} customLogo={customLogo} headerSubtitle={headerSubtitle} slideInterval={intervalScreen2} cityName={cityName} onBack={() => setView('menu')} t={t} lang={lang} />;
  if (view === 'screen3') return <ImageSlideshowScreen items={offers} title="Angebote & News" icon={Tag} showNewsTicker={true} customLogo={customLogo} tickerText={tickerText} headerSubtitle={headerSubtitle} slideInterval={intervalScreen3} cityName={cityName} onBack={() => setView('menu')} t={t} lang={lang} />;

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 md:p-12 text-white font-sans relative overflow-hidden" dir={dir}>
      
      {showPinModal && (
        <PinProtectionModal 
          onVerify={handleVerifyPin} 
          onClose={() => setShowPinModal(false)} 
          t={t} 
          lang={lang} 
        />
      )}

      <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #fbbf24 2px, transparent 2px)', backgroundSize: '50px 50px' }}></div>

      <div className="absolute top-6 left-6 z-20">
        <LanguageToggle lang={lang} setLang={handleSetLang} />
      </div>

      <div className="text-center mb-16 relative z-10">
        <div className="mb-6 inline-block bg-white p-1 rounded-full border-4 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.5)] w-48 h-48 lg:w-60 lg:h-60 overflow-hidden">
           {customLogo ? (
             <img src={customLogo} alt="Shop Logo" className="w-full h-full object-contain rounded-full p-2" />
           ) : (
             <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
               <Globe className="w-24 h-24 text-yellow-400" />
             </div>
           )}
        </div>
        <h1 className={`text-6xl md:text-8xl font-black mb-6 tracking-widest uppercase ${goldTextGradient} drop-shadow-2xl`}>
          HANDYLAND
        </h1>
        <p className="text-gray-300 text-2xl font-light tracking-wide bg-black/60 px-8 py-3 rounded-full border border-yellow-500/30 backdrop-blur-md inline-block">
          {t.systemTitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full relative z-10">
        <button onClick={() => setView('screen1')} className="group bg-black/90 hover:bg-black border-2 border-yellow-500/40 hover:border-yellow-400 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl">
          <div className="bg-yellow-500/10 group-hover:bg-yellow-500 p-8 rounded-full mb-8 transition-colors border border-yellow-500/20 shadow-inner">
             <Smartphone className="w-16 h-16 text-yellow-400 group-hover:text-black" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black mb-3 text-white leading-tight px-2 break-words w-full text-center">{t.screen1Title}</h2>
          <p className="text-yellow-400 font-bold tracking-wider uppercase text-base lg:text-lg">{t.screen1Sub}</p>
        </button>

        <button onClick={() => setView('screen2')} className="group bg-black/90 hover:bg-black border-2 border-yellow-500/40 hover:border-yellow-400 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl">
          <div className="bg-yellow-500/10 group-hover:bg-yellow-500 p-8 rounded-full mb-8 transition-colors border border-yellow-500/20 shadow-inner">
            <Wrench className="w-16 h-16 text-yellow-400 group-hover:text-black" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black mb-3 text-white leading-tight px-2 break-words w-full text-center">{t.screen2Title}</h2>
          <p className="text-yellow-400 font-bold tracking-wider uppercase text-base lg:text-lg">{t.screen2Sub}</p>
        </button>

        <button onClick={() => setView('screen3')} className="group bg-black/90 hover:bg-black border-2 border-yellow-500/40 hover:border-yellow-400 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl">
          <div className="bg-yellow-500/10 group-hover:bg-yellow-500 p-8 rounded-full mb-8 transition-colors border border-yellow-500/20 shadow-inner">
            <Tag className="w-16 h-16 text-yellow-400 group-hover:text-black" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black mb-3 text-white leading-tight px-2 break-words w-full text-center">{t.screen3Title}</h2>
          <p className="text-yellow-400 font-bold tracking-wider uppercase text-base lg:text-lg">{t.screen3Sub}</p>
        </button>

        <button onClick={handleOpenAdmin} className="group bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 border-2 border-yellow-300 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(234,179,8,0.4)] relative">
          <div className="absolute top-4 right-4 bg-black/60 p-2 rounded-full border border-yellow-400/40">
            <Lock className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="bg-black p-8 rounded-full mb-8 transition-colors shadow-2xl">
            <Settings className="w-16 h-16 text-yellow-400" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black mb-3 text-black leading-tight px-2 break-words w-full text-center">{t.adminBtnTitle}</h2>
          <p className="text-black/80 font-extrabold text-base lg:text-lg leading-snug">{t.adminBtnSub}</p>
        </button>
      </div>
    </div>
  );
}
