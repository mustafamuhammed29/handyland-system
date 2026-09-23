import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Sparkles, Flame, CheckCircle2, Clock, 
  Info, Utensils, Play, Pause, ChevronRight, ChevronLeft, Award, Layers, 
  ArrowRight, ArrowLeft, Maximize
} from 'lucide-react';
import { HandylandHeader } from '../common/HandylandHeader';
import { TVScreenControls } from '../common/TVScreenControls';
import { TVBackControl } from '../common/TVBackControl';
import { isVideoMedia, getMediaSrc } from '../../utils/mediaHelpers';
import { DEFAULT_TICKER, DEFAULT_TICKER_SPEED } from '../../constants/defaults';
import { requestUniversalFullscreen, exitUniversalFullscreen } from '../../utils/fullscreenHelpers';

const goldTextGradient = "text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-400 to-amber-500";

// دالة ذكية لاختيار أيقونة شهية مناسبة لكل مكون بناءً على اسمه (بالألمانية أو العربية)
const getIngredientIcon = (text = '') => {
  const lower = text.toLowerCase();
  if (lower.includes('hähnchen') || lower.includes('chicken') || lower.includes('crispy') || lower.includes('geflügel') || lower.includes('panier') || lower.includes('دجاج')) return '🍗';
  if (lower.includes('pommes') || lower.includes('fries') || lower.includes('kartoffel') || lower.includes('frites') || lower.includes('بطاطس')) return '🍟';
  if (lower.includes('salat') || lower.includes('kraut') || lower.includes('kohl') || lower.includes('gurke') || lower.includes('tomate') || lower.includes('gemüse') || lower.includes('سلطة')) return '🥗';
  if (lower.includes('toum') || lower.includes('knoblauch') || lower.includes('thoum') || lower.includes('ثوم')) return '🧄';
  if (lower.includes('soße') || lower.includes('sauce') || lower.includes('dip') || lower.includes('cocktail') || lower.includes('mayo') || lower.includes('ketchup') || lower.includes('صوص')) return '🥣';
  if (lower.includes('fleisch') || lower.includes('rind') || lower.includes('beef') || lower.includes('steak') || lower.includes('burger') || lower.includes('لحم')) return '🥩';
  if (lower.includes('brot') || lower.includes('fladenbrot') || lower.includes('bun') || lower.includes('sesam') || lower.includes('خبز')) return '🥖';
  if (lower.includes('käse') || lower.includes('cheddar') || lower.includes('cheese') || lower.includes('mozzarella') || lower.includes('جبن')) return '🧀';
  if (lower.includes('scharf') || lower.includes('chili') || lower.includes('jalapeño') || lower.includes('spicy') || lower.includes('حار')) return '🌶️';
  if (lower.includes('zwiebel') || lower.includes('بصل')) return '🧅';
  if (lower.includes('zitrone') || lower.includes('lemon') || lower.includes('ليمون')) return '🍋';
  if (lower.includes('reis') || lower.includes('rice') || lower.includes('أرز')) return '🍚';
  if (lower.includes('getränk') || lower.includes('cola') || lower.includes('wasser') || lower.includes('مشروب')) return '🥤';
  if (lower.includes('grill') || lower.includes('spieß') || lower.includes('مشوي')) return '🔥';
  return '✨';
};

export const RestaurantShowcaseScreen = ({
  items = [],
  title,
  icon = Sparkles,
  showNewsTicker = false,
  showHeader = true,
  customLogo,
  tickerText,
  tickerSpeed = DEFAULT_TICKER_SPEED,
  headerSubtitle,
  slideInterval = 10,
  cityName,
  onBack,
  t,
  lang = 'de',
  isOffline = false,
  systemName = "ALSAFI"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showRemoteFullscreenBadge, setShowRemoteFullscreenBadge] = useState(false);

  const videoRef = useRef(null);
  const lastTapRef = useRef(0);
  const intervalSeconds = Math.max(4, parseInt(slideInterval) || 10);

  // دالة النقر المزدوج للتكبير/التصغير ملء الشاشة
  const handleToggleFullscreen = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isFull = Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
    if (!isFull) {
      requestUniversalFullscreen();
    } else {
      exitUniversalFullscreen();
    }
  }, []);

  // دعم النقر المزدوج على الشاشات اللمسية
  const handleTouchEnd = useCallback((e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    if (tapLength < 350 && tapLength > 0) {
      handleToggleFullscreen(e);
    }
    lastTapRef.current = currentTime;
  }, [handleToggleFullscreen]);

  const handleNextSlide = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setProgress(0);
  }, [items.length]);

  const handlePrevSlide = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setProgress(0);
  }, [items.length]);

  // دعم أزرار الريموت كنترول للأسهم والتوقف المؤقت والتنقل
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'MediaTrackNext') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'MediaTrackPrevious') {
        handlePrevSlide();
      } else if (e.key === ' ' || e.key === 'MediaPlayPause') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextSlide, handlePrevSlide]);

  // تصحيح المؤشر لو تم حذف عناصر
  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [items.length, currentIndex]);

  const currentItem = items[currentIndex % (items.length || 1)] || null;
  const nextItem = items.length > 1 ? items[(currentIndex + 1) % items.length] : null;
  const isCurrentVideo = currentItem ? isVideoMedia(currentItem.imageData) : false;

  // استخراج قائمة المكونات بشكل منظم ونظيف
  const ingredientsList = React.useMemo(() => {
    if (!currentItem || !currentItem.ingredients) return [];
    if (Array.isArray(currentItem.ingredients)) {
      return currentItem.ingredients.map(s => String(s).trim()).filter(Boolean);
    }
    if (typeof currentItem.ingredients === 'string') {
      try {
        const parsed = JSON.parse(currentItem.ingredients);
        if (Array.isArray(parsed)) {
          return parsed.map(s => String(s).trim()).filter(Boolean);
        }
      } catch (e) {
        // تقسيم عبر الفواصل والأسطر مع إزالة الرموز
        return currentItem.ingredients
          .split(/[,،\n]+/)
          .map(s => s.replace(/^[•\-\*]\s*/, '').trim())
          .filter(Boolean);
      }
    }
    return [];
  }, [currentItem]);

  // حركة الظهور المتسلسل للمكونات (Staggered Animation)
  useEffect(() => {
    setRevealedCount(0);
    if (ingredientsList.length === 0) return;

    let count = 0;
    const initialDelay = setTimeout(() => {
      const interval = setInterval(() => {
        count += 1;
        setRevealedCount(count);
        if (count >= ingredientsList.length) {
          clearInterval(interval);
        }
      }, 160);
      return () => clearInterval(interval);
    }, 250);

    return () => clearTimeout(initialDelay);
  }, [currentIndex, ingredientsList]);

  // مؤقت التبديل وشريط التقدم الزمني الدقيق
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    if (!isCurrentVideo) {
      const stepMs = 50;
      const totalSteps = (intervalSeconds * 1000) / stepMs;
      let currentStep = 0;

      const progressTimer = setInterval(() => {
        currentStep += 1;
        setProgress(Math.min(100, (currentStep / totalSteps) * 100));

        if (currentStep >= totalSteps) {
          clearInterval(progressTimer);
          handleNextSlide();
        }
      }, stepMs);

      return () => clearInterval(progressTimer);
    } else {
      const safetyTimer = setTimeout(handleNextSlide, 60000);
      return () => clearTimeout(safetyTimer);
    }
  }, [items.length, intervalSeconds, currentIndex, isCurrentVideo, isPaused, handleNextSlide]);

  // دعم حدث التكبير عن بعد
  useEffect(() => {
    const handleRemoteFullscreenEvent = () => {
      setShowRemoteFullscreenBadge(true);
      const timer = setTimeout(() => setShowRemoteFullscreenBadge(false), 12000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('tv_remote_fullscreen_requested', handleRemoteFullscreenEvent);
    return () => window.removeEventListener('tv_remote_fullscreen_requested', handleRemoteFullscreenEvent);
  }, []);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // شاشة الانتظار في حال لم تكن هناك أطباق مضافة بعد
  if (!items || items.length === 0) {
    return (
      <div 
        onDoubleClick={handleToggleFullscreen}
        onTouchEnd={handleTouchEnd}
        className="flex flex-col h-screen max-h-screen w-full bg-[#070709] text-white font-sans relative overflow-hidden select-none cursor-pointer" 
        dir={dir}
        title={lang === 'ar' ? 'انقر نقراً مزدوجاً للتكبير ملء الشاشة' : 'Doppelklick für Vollbild'}
      >
        <TVScreenControls />
        <TVBackControl onBack={onBack} t={t} />

        {showHeader && (
          <HandylandHeader 
            title={title || (lang === 'ar' ? 'استعراض الأطباق الفاخرة' : 'Showcase & Zutaten')}
            icon={icon}
            customLogo={customLogo}
            headerSubtitle={headerSubtitle}
            cityName={cityName}
            lang={lang}
            isOffline={isOffline}
            systemName={systemName}
          />
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-full overflow-hidden border-4 border-amber-400 p-6 bg-amber-500/10 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.4)] mb-6 animate-pulse">
            <Utensils className="w-20 h-20 text-amber-400" />
          </div>
          <h2 className={`text-4xl lg:text-6xl font-black mb-4 tracking-wide ${goldTextGradient}`}>
            {title || (lang === 'ar' ? 'استعراض أطباق ومكونات الصافي' : 'Alsafi Speisen Showcase')}
          </h2>
          <div className="text-xl lg:text-2xl text-gray-300 font-medium bg-black/70 px-10 py-5 rounded-3xl border border-amber-500/30 backdrop-blur-md max-w-2xl shadow-2xl">
            {lang === 'ar' 
              ? 'جاهز للعرض • أضف أطباقك ومكوناتها وصورها الآن من لوحة التحكم لتظهر هنا فوراً!' 
              : 'Bereit zur Anzeige • Fügen Sie Gerichte und Zutaten im Admin-Bereich hinzu!'}
          </div>
        </div>

        {showNewsTicker && (
          <footer className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black py-3.5 shadow-2xl z-30 flex border-t-4 border-amber-600 overflow-hidden relative shrink-0">
            <div className="flex items-center px-8 bg-black/10 z-40 font-black text-2xl lg:text-3xl gap-4 whitespace-nowrap border-r-4 border-amber-600 shadow-xl tracking-wider">
              <Info className="w-8 h-8 animate-pulse" />
              {systemName} SHOWCASE
            </div>
            <div className="flex-1 relative overflow-hidden flex items-center">
              <p 
                className="absolute whitespace-nowrap text-3xl lg:text-4xl font-black animate-marquee w-full text-left tracking-wider"
                style={{ animationDuration: `${parseInt(tickerSpeed) || DEFAULT_TICKER_SPEED}s` }}
              >
                {tickerText || DEFAULT_TICKER}
              </p>
            </div>
          </footer>
        )}
      </div>
    );
  }

  const mediaSrc = getMediaSrc(currentItem.imageData);

  return (
    <div 
      onDoubleClick={handleToggleFullscreen}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col h-screen max-h-screen w-full bg-[#070709] text-white overflow-hidden font-sans relative select-none" 
      dir={dir}
      title={lang === 'ar' ? 'انقر نقراً مزدوجاً للتكبير ملء الشاشة' : 'Doppelklick für Vollbild'}
    >
      <TVScreenControls />
      <TVBackControl onBack={onBack} t={t} />

      {/* خلفية سينمائية محيطية دافئة مشعة مستخرجة من صورة الطبق الحالية لملء كامل الشاشة */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img 
          src={mediaSrc} 
          alt="" 
          className="w-full h-full object-cover blur-3xl opacity-25 scale-125 transform-gpu transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/85 to-[#070709]/75" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[140px]" />
      </div>

      {/* شريط علوي للهيدر إذا كان مفعلاً */}
      {showHeader && (
        <HandylandHeader 
          title={title || (lang === 'ar' ? 'استعراض الأطباق والمكونات' : 'Showcase & Zutaten')}
          icon={icon}
          customLogo={customLogo}
          headerSubtitle={headerSubtitle}
          cityName={cityName}
          lang={lang}
          isOffline={isOffline}
          systemName={systemName}
        />
      )}

      {/* شريط الليزر النيون الزمني الدقيق للتبديل بين الأطباق في أعلى الشاشة */}
      <div className="h-1.5 w-full bg-black/80 relative z-50 overflow-hidden shrink-0">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 transition-all duration-100 ease-linear shadow-[0_0_20px_#f59e0b]" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* زر تأكيد التكبير عن بُعد إن طلبه المتصفح */}
      {showRemoteFullscreenBadge && !document.fullscreenElement && (
        <button
          onClick={() => {
            try {
              document.documentElement.requestFullscreen().catch(() => {});
            } catch (e) {}
            setShowRemoteFullscreenBadge(false);
          }}
          className="fixed inset-x-0 top-16 mx-auto w-fit z-[9999999] bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black px-8 py-4 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.9)] text-lg lg:text-xl animate-bounce border-4 border-black cursor-pointer"
        >
          📺 {lang === 'ar' ? 'انقر هنا أو اضغط أي زر بالريموت لتثبيت ملء الشاشة' : 'Tippen oder OK am TV drücken für Vollbild'}
        </button>
      )}

      {/* ========================================================================= */}
      {/* المسرح الرئيسي السينمائي الممتد من الحافة للحافة بدون أي فراغات ميتة (Edge-to-Edge Hero Canvas) */}
      {/* ========================================================================= */}
      <main className="flex-1 relative w-full h-full min-h-0 flex flex-col lg:flex-row overflow-hidden z-10 p-0 m-0">

        {/* ------------------------------------------------------------- */}
        {/* الجانب الأول: مسرح صورة الوجبة العملاقة فائق الوضوح (67% + امتداد تحت الفاصل) */}
        {/* ------------------------------------------------------------- */}
        <div className="relative w-full lg:w-[67%] h-full flex flex-col justify-between overflow-hidden lg:overflow-visible bg-black shrink-0 border-b lg:border-b-0 z-10">
          
          {/* أنماط الحركات البصرية الفاخرة للفاصل التموجي والجزيئات السابحة */}
          <style>{`
            @keyframes shimmerSweep {
              0% { transform: translateX(-150%) skewX(-20deg); }
              35%, 100% { transform: translateX(250%) skewX(-20deg); }
            }
            @keyframes slowSpin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes floatParticle {
              0% {
                transform: translateY(0) translateX(0) scale(0.6);
                opacity: 0;
              }
              25% {
                opacity: 0.85;
              }
              75% {
                opacity: 0.65;
              }
              100% {
                transform: translateY(-850px) translateX(25px) scale(1.3);
                opacity: 0;
              }
            }
            @keyframes cardAmbientPulse {
              0%, 100% {
                border-color: rgba(245, 158, 11, 0.3);
                box-shadow: 0 0 0 rgba(245, 158, 11, 0);
              }
              50% {
                border-color: rgba(251, 191, 36, 0.6);
                box-shadow: 0 0 14px rgba(245, 158, 11, 0.22);
              }
            }
            @keyframes dashStreamFlow {
              from { stroke-dashoffset: 0; }
              to { stroke-dashoffset: -80; }
            }
            @keyframes pulseStreakRun {
              0% { stroke-dashoffset: 300; opacity: 0; }
              15% { opacity: 1; }
              85% { opacity: 1; }
              100% { stroke-dashoffset: -1300; opacity: 0; }
            }
            @keyframes laserAuraBreathe {
              0%, 100% { opacity: 0.35; stroke-width: 9px; }
              50% { opacity: 0.75; stroke-width: 15px; }
            }
          `}</style>

          {/* الصورة الأساسية بدقة عالية جداً وواضحة تماماً بدون أي تعتيم أو تدرجات تحجب تفاصيل الطعام */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-[calc(100%+95px)] h-full overflow-hidden">
            {isCurrentVideo ? (
              <video
                ref={videoRef}
                key={`main-vid-${currentItem.id}`}
                src={mediaSrc}
                autoPlay={!isPaused}
                muted
                playsInline
                onEnded={handleNextSlide}
                className="w-full h-full object-cover transition-transform duration-1000 ease-out"
                style={{ transform: 'scale(1.01)' }}
              />
            ) : (
              <img
                key={`main-img-${currentItem.id}`}
                src={mediaSrc}
                alt={currentItem.title || "Dish"}
                className="w-full h-full object-cover transition-transform duration-[14000ms] ease-out transform-gpu"
                style={{ transform: isPaused ? 'scale(1.0)' : 'scale(1.05)' }}
              />
            )}

            {/* تدرج سفلي طفيف وناعم جداً فقط خلف شارات الجودة دون حجب الطبق */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
          </div>

          {/* شارة التميز العائمة الفاخرة ثلاثية الأبعاد (Badge) في الزاوية العلوية */}
          <div className="relative z-20 p-6 lg:p-8 flex items-start justify-between pointer-events-none">
            {currentItem.badge ? (
              <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-black px-6 lg:px-8 py-2.5 lg:py-3.5 rounded-2xl shadow-[0_10px_35px_rgba(239,68,68,0.7)] text-lg lg:text-2xl border-2 border-white/60 flex items-center gap-3 animate-pulse backdrop-blur-md">
                <Flame className="w-6 h-6 lg:w-7 lg:h-7 text-yellow-300" />
                <span>{currentItem.badge}</span>
              </div>
            ) : <div />}

            {/* ختم التميز والجودة الذهبي الدائري في الزاوية المقابلة */}
            <div className="hidden sm:flex items-center justify-center">
              <div className="relative w-20 h-20 rounded-full border-2 border-amber-400/80 bg-black/60 backdrop-blur-md flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                <div 
                  className="absolute inset-1 rounded-full border border-dashed border-amber-300/60" 
                  style={{ animation: 'slowSpin 25s linear infinite' }}
                />
                <div className="flex flex-col items-center justify-center text-center p-1">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 mt-0.5">ALSAFI</span>
                  <span className="text-[7px] font-bold text-gray-300 uppercase tracking-tighter">PREMIUM</span>
                </div>
              </div>
            </div>
          </div>

          {/* شارات ضمان الجودة أسفل الصورة بصيغة شريط أنيق شفاف لا يغطي الطعام */}
          <div className="relative z-20 p-5 lg:p-7 flex flex-wrap items-center gap-2.5">
            <div className="bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 font-extrabold px-3.5 py-1.5 rounded-xl text-xs lg:text-sm shadow-xl flex items-center gap-2">
              <span className="text-sm">🌿</span>
              <span>100% Halal</span>
            </div>
            <div className="bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 font-extrabold px-3.5 py-1.5 rounded-xl text-xs lg:text-sm shadow-xl flex items-center gap-2">
              <span className="text-sm">🔥</span>
              <span>{lang === 'ar' ? 'طازج ومحضر على الطلب' : 'Frisch zubereitet'}</span>
            </div>
            <div className="bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 font-extrabold px-3.5 py-1.5 rounded-xl text-xs lg:text-sm shadow-xl flex items-center gap-2">
              <span className="text-sm">👨‍🍳</span>
              <span>{lang === 'ar' ? 'وصفة الصافي الخاصة' : 'Hausgemacht'}</span>
            </div>
          </div>


          {/* أزرار تنقل جانبية للمساعدة */}
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 z-30">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }}
              className="pointer-events-auto p-4 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition cursor-pointer shadow-xl active:scale-95"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
              className="pointer-events-auto p-4 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition cursor-pointer shadow-xl active:scale-95"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* الجانب الثاني: جناح المعلومات والمكونات تحت بعض (33% من الشاشة) */}
        {/* ------------------------------------------------------------- */}
        <div className="relative w-full lg:w-[33%] lg:flex-1 h-full flex flex-col justify-between p-5 lg:py-7 lg:pr-7 lg:pl-14 xl:py-8 xl:pr-8 xl:pl-16 bg-gradient-to-br from-[#121319] via-[#0c0d12] to-[#070709] lg:bg-transparent overflow-hidden z-30 shadow-2xl">
          
          {/* إضاءات خلفية داخلية ناعمة */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

          {/* جزيئات وذرات ذهبية سابحة بنعومة في خلفية قسم المعلومات لإضفاء حياة وحركة جذابة */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {[...Array(14)].map((_, i) => (
              <div
                key={`ember-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: `${(i % 3) * 2 + 2}px`,
                  height: `${(i % 3) * 2 + 2}px`,
                  left: `${(i * 17 + 8) % 92}%`,
                  bottom: '-20px',
                  backgroundColor: i % 2 === 0 ? '#fbbf24' : '#f59e0b',
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)',
                  animation: `floatParticle ${5 + (i % 4) * 2.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.45}s`
                }}
              />
            ))}
          </div>

          {/* 1. الجزء العلوي: تصنيف الطبق + الاسم العريض + السعر الذهبي الضخم مع لمعان متحرك */}
          <div className="space-y-2.5 relative z-10 shrink-0">
            
            {/* شريط التصنيف العلوي مع السعرات */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-400 font-black uppercase tracking-widest text-xs">
                  {lang === 'ar' ? '✦ طبق الصافي المميز ✦' : '✦ ALSAFI SPEZIALITÄT ✦'}
                </span>
              </div>

              {currentItem.calories && (
                <span className="bg-white/10 border border-white/20 text-amber-300 font-bold px-3 py-0.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>{currentItem.calories}</span>
                </span>
              )}
            </div>

            {/* عنوان الوجبة + كبسولة السعر الذهبية البراقة مع شريط لمعان ليزري */}
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] flex-1 min-w-0">
                {currentItem.title || (lang === 'ar' ? 'وجبة شهية ومميزة' : 'Köstliches Menü')}
              </h1>

              {currentItem.price && (
                <div className="shrink-0">
                  <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-2xl lg:text-3xl xl:text-4xl px-5 py-2 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)] border-2 border-white/60 tracking-tight transform hover:scale-105 transition">
                    <span className="relative z-10">{currentItem.price}</span>
                    {/* لمعان ضوئي متحرك Sweep Shimmer */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"
                      style={{ animation: 'shimmerSweep 3.5s infinite' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* الوصف التسويقي المشهي */}
            {currentItem.description && (
              <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/10 shadow-inner">
                <p className="text-gray-200 text-xs lg:text-sm font-medium leading-relaxed">
                  {currentItem.description}
                </p>
              </div>
            )}

          </div>

          {/* 2. الجزء الأوسط: قائمة المكونات مرتبة بدقة عمودياً (تحت بعض) لملء المساحة بشكل منظم */}
          <div className="flex-1 flex flex-col justify-center my-2 relative min-h-0 overflow-hidden z-10">
            
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 shrink-0">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'ar' ? 'المكونات وتفاصيل الطبق:' : 'Zutaten & Details:'}
              </span>
              <span className="text-[11px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                {ingredientsList.length} {lang === 'ar' ? 'مكونات' : 'Zutaten'}
              </span>
            </div>

            {ingredientsList.length === 0 ? (
              <div className="text-gray-400 italic text-sm bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                {lang === 'ar' ? 'مكونات طازجة ومحضرة بأعلى معايير الجودة' : 'Frische Zutaten nach höchsten Qualitätsstandards'}
              </div>
            ) : (
              /* تخطيط عمودي: المكونات تحت بعض بشكل جذاب مع أيقونات وأرقام ولمعان خفيف */
              <div className="flex flex-col gap-2 overflow-y-auto pr-1">
                {ingredientsList.map((ingredient, idx) => {
                  const isVisible = idx < revealedCount;
                  const icon = getIngredientIcon(ingredient);

                  return (
                    <div
                      key={idx}
                      className={`relative overflow-hidden flex items-center justify-between p-2.5 lg:p-3 rounded-xl border transition-all duration-400 transform ${
                        isVisible 
                          ? 'opacity-100 translate-x-0 bg-gradient-to-r from-amber-500/15 via-white/[0.04] to-transparent border-amber-500/40 shadow-md scale-100 hover:border-amber-400' 
                          : 'opacity-0 translate-x-6 scale-95 border-transparent pointer-events-none'
                      }`}
                      style={{ 
                        transitionDelay: `${idx * 40}ms`,
                        animation: isVisible ? `cardAmbientPulse ${4 + (idx % 3)}s ease-in-out infinite` : 'none',
                        animationDelay: `${idx * 0.35}s`
                      }}
                    >
                      {/* خط نيون عمودي يسار كل بطاقة يعطي رونقاً حياً */}
                      <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 opacity-75" />

                      <div className="flex items-center gap-2.5 min-w-0 pl-1">
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-[11px] flex items-center justify-center shadow shrink-0">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="text-base shrink-0">{icon}</span>
                        <span className="text-xs lg:text-sm font-black text-white tracking-wide truncate">
                          {ingredient}
                        </span>
                      </div>

                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-1.5" />
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* 3. الجزء السفلي: استعراض الطبق القادم (Als Nächstes) أو شريط النكهات وتقييم الزبائن + أزرار التحكم */}
          <div className="space-y-2.5 pt-2 border-t border-white/10 relative z-10 shrink-0">
            
            {/* بطاقة تشويقية للطبق القادم أو شريط النكهات والتقييمات المميزة */}
            {items.length > 1 && nextItem ? (
              <div 
                onClick={handleNextSlide}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 rounded-2xl p-2 backdrop-blur-md transition cursor-pointer group"
                title={lang === 'ar' ? 'انقر للانتقال للطبق القادم فوراً' : 'Klicken für nächstes Gericht'}
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-amber-500/40 group-hover:scale-105 transition-transform">
                  <img src={getMediaSrc(nextItem.imageData)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <span>{lang === 'ar' ? 'الطبق القادم' : 'Als Nächstes'}</span>
                    {dir === 'rtl' ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                  </span>
                  <h4 className="text-xs lg:text-sm font-black text-white truncate">
                    {nextItem.title || (lang === 'ar' ? 'طبق الصافي' : 'Gericht')}
                  </h4>
                </div>
                {nextItem.price && (
                  <div className="text-amber-400 font-black text-xs px-2.5 py-1 bg-amber-500/10 rounded-xl border border-amber-500/30 shrink-0">
                    {nextItem.price}
                  </div>
                )}
              </div>
            ) : (
              /* بطاقات النكهات وتقييم الضيوف (بدون تكرار شارات الصورة) */
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/[0.04] border border-amber-500/20 rounded-xl p-2 text-center backdrop-blur-sm shadow-sm">
                  <span className="text-[10px] text-amber-400 font-bold block">{lang === 'ar' ? 'المذاق' : 'Geschmack'}</span>
                  <span className="text-xs font-black text-white">🔥 {lang === 'ar' ? 'مقرمش وشهي' : 'Knusprig'}</span>
                </div>
                <div className="bg-white/[0.04] border border-amber-500/20 rounded-xl p-2 text-center backdrop-blur-sm shadow-sm">
                  <span className="text-[10px] text-amber-400 font-bold block">{lang === 'ar' ? 'المقبلات' : 'Beilagen'}</span>
                  <span className="text-xs font-black text-white">🍟 {lang === 'ar' ? 'بطاطس وصوص' : 'Inklusive'}</span>
                </div>
                <div className="bg-white/[0.04] border border-amber-500/20 rounded-xl p-2 text-center backdrop-blur-sm shadow-sm">
                  <span className="text-[10px] text-amber-400 font-bold block">{lang === 'ar' ? 'تقييم الضيوف' : 'Gäste-Echo'}</span>
                  <span className="text-xs font-black text-amber-300">⭐ 4.9 / 5.0</span>
                </div>
              </div>
            )}

            {/* شريط العداد مع مؤشر زمني دائري وأزرار الإيقاف/الاستئناف */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-0.5">
              <div className="flex items-center gap-2 font-mono font-bold text-xs lg:text-sm">
                {/* مؤشر زمني دائري صغير للتبديل */}
                <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-amber-400 transition-all duration-100"
                      strokeDasharray={`${progress}, 100`}
                      strokeWidth="5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
                <span className="text-amber-400 text-base font-black">
                  {((currentIndex % items.length) + 1).toString().padStart(2, '0')}
                </span>
                <span>/</span>
                <span className="text-gray-400">
                  {items.length.toString().padStart(2, '0')}
                </span>
                <span className="text-[11px] text-gray-400 ml-1 font-sans">
                  {lang === 'ar' ? 'أطباق' : 'Gerichte'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setIsPaused(p => !p); }} 
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-white font-bold transition text-xs cursor-pointer border border-white/10 active:scale-95"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-yellow-400" />}
                  <span>{isPaused ? (lang === 'ar' ? 'استئناف' : 'Fortsetzen') : (lang === 'ar' ? 'إيقاف مؤقت' : 'Pausieren')}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* خلفية الجناح الأيمن السينمائية مع الفاصل الليزري التموجي الحي المتدفق بأنميشن عصري فاخر */}
        <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden">
          <svg 
            className="w-full h-full" 
            viewBox="0 0 1920 1080" 
            preserveAspectRatio="none"
          >
            <defs>
              {/* تدرج لوني فخم لكامل خلفية الجناح الأيمن يبدأ من خط المنحنى ويمتد حتى حافة الشاشة اليمنى */}
              <linearGradient id="panelSideFillGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#121319" />
                <stop offset="50%" stopColor="#0c0d12" />
                <stop offset="100%" stopColor="#070709" />
              </linearGradient>

              {/* التدرج اللوني الذهبي المتوهج لشعاع الليزر المتموج الرئيسي */}
              <linearGradient id="laserWaveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                <stop offset="25%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.95" />
                <stop offset="75%" stopColor="#ea580c" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
              </linearGradient>

              {/* تدرج ومضة الليزر فائقة السرعة المتدفقة عبر الخط */}
              <linearGradient id="laserPulseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="65%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
              </linearGradient>

              {/* توهج النيون الفاخر للشعاع والخرزة المتحركة */}
              <filter id="neonBeamGlow" x="-80%" y="-20%" width="260%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* هالة التوهج العميق المحيطية */}
              <filter id="neonDeepAura" x="-100%" y="-50%" width="300%" height="200%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. تعبئة خلفية القائمة الفاخرة المتموجة الحية المتناغمة بدقة 100% مع حركة الخط */}
            <path
              fill="url(#panelSideFillGrad)"
              d="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080 L 1920 1080 L 1920 0 Z"
            >
              <animate
                attributeName="d"
                dur="7s"
                repeatCount="indefinite"
                values="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080 L 1920 1080 L 1920 0 Z; M 1272 0 C 1296 110, 1316 210, 1298 390 C 1272 500, 1258 590, 1282 710 C 1314 800, 1312 920, 1262 1080 L 1920 1080 L 1920 0 Z; M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080 L 1920 1080 L 1920 0 Z"
                calcMode="spline"
                keyTimes="0; 0.5; 1"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
              />
            </path>

            {/* 2. هالة التوهج الذهبي العميقة المتنفسة خلف الفاصل */}
            <path
              fill="none"
              stroke="#f59e0b"
              strokeWidth="11"
              strokeOpacity="0.45"
              filter="url(#neonDeepAura)"
              style={{ animation: 'laserAuraBreathe 3.5s ease-in-out infinite' }}
              d="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080"
            >
              <animate
                attributeName="d"
                dur="7s"
                repeatCount="indefinite"
                values="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080; M 1272 0 C 1296 110, 1316 210, 1298 390 C 1272 500, 1258 590, 1282 710 C 1314 800, 1312 920, 1262 1080; M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080"
                calcMode="spline"
                keyTimes="0; 0.5; 1"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
              />
            </path>

            {/* 3. مسار شعاع الليزر الذهبي الرئيسي المتموج المورفينغ */}
            <path
              fill="none"
              stroke="url(#laserWaveGrad)"
              strokeWidth="3.5"
              filter="url(#neonBeamGlow)"
              d="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080"
            >
              <animate
                attributeName="d"
                dur="7s"
                repeatCount="indefinite"
                values="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080; M 1272 0 C 1296 110, 1316 210, 1298 390 C 1272 500, 1258 590, 1282 710 C 1314 800, 1312 920, 1262 1080; M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080"
                calcMode="spline"
                keyTimes="0; 0.5; 1"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
              />
            </path>

            {/* 4. خيط الطاقة الأبيض فائق النقاء في قلب الشعاع الذهبي */}
            <path
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeOpacity="0.8"
              d="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080"
            >
              <animate
                attributeName="d"
                dur="7s"
                repeatCount="indefinite"
                values="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080; M 1272 0 C 1296 110, 1316 210, 1298 390 C 1272 500, 1258 590, 1282 710 C 1314 800, 1312 920, 1262 1080; M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080"
                calcMode="spline"
                keyTimes="0; 0.5; 1"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
              />
            </path>

            {/* 5. ومضات نبضية فائقة السرعة تتدفق عبر الخط بشكل دوري بانسيابية مبهرة */}
            <path
              fill="none"
              stroke="url(#laserPulseGrad)"
              strokeWidth="4"
              strokeDasharray="160 1200"
              filter="url(#neonBeamGlow)"
              style={{ animation: 'pulseStreakRun 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
              d="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080"
            >
              <animate
                attributeName="d"
                dur="7s"
                repeatCount="indefinite"
                values="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080; M 1272 0 C 1296 110, 1316 210, 1298 390 C 1272 500, 1258 590, 1282 710 C 1314 800, 1312 920, 1262 1080; M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080"
                calcMode="spline"
                keyTimes="0; 0.5; 1"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
              />
            </path>

            {/* 6. خط الطاقة الرقمي المرافق (Cyber-Luxe Dashed Energy Stream) المتدفق بحركة مستمرة */}
            <path
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.2"
              strokeOpacity="0.4"
              strokeDasharray="6 14"
              style={{ animation: 'dashStreamFlow 2.2s linear infinite' }}
              d="M 1270 0 C 1290 100, 1332 220, 1316 380 C 1293 480, 1260 570, 1282 720 C 1312 820, 1326 930, 1278 1080"
            >
              <animate
                attributeName="d"
                dur="7s"
                repeatCount="indefinite"
                values="M 1270 0 C 1290 100, 1332 220, 1316 380 C 1293 480, 1260 570, 1282 720 C 1312 820, 1326 930, 1278 1080; M 1280 0 C 1304 110, 1324 210, 1306 390 C 1280 500, 1266 590, 1290 710 C 1322 800, 1320 920, 1270 1080; M 1270 0 C 1290 100, 1332 220, 1316 380 C 1293 480, 1260 570, 1282 720 C 1312 820, 1326 930, 1278 1080"
                calcMode="spline"
                keyTimes="0; 0.5; 1"
                keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
              />
            </path>

            {/* 7. خرزة الطاقة الذهبية المشعة المتنقلة بمرونة سلايدر على مسار المنحنى */}
            <g>
              <circle r="4" fill="#ffffff" filter="url(#neonBeamGlow)" />
              <circle r="8" fill="#fbbf24" opacity="0.8" filter="url(#neonBeamGlow)" />
              <circle r="16" fill="#ea580c" opacity="0.35" filter="url(#neonDeepAura)" />
              <animateMotion
                path="M 1262 0 C 1282 100, 1324 220, 1308 380 C 1285 480, 1252 570, 1274 720 C 1304 820, 1318 930, 1270 1080"
                dur="5s"
                repeatCount="indefinite"
                keyPoints="0;1;0"
                keyTimes="0;0.5;1"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              />
            </g>
          </svg>
        </div>

      </main>

      {/* شريط الأخبار الترويجي اختياري إن كان مفعلاً */}
      {showNewsTicker && (
        <footer className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black py-3.5 shadow-2xl z-30 flex border-t-4 border-amber-600 overflow-hidden relative shrink-0">
          <div className="flex items-center px-8 bg-black/10 z-40 font-black text-2xl lg:text-3xl gap-4 whitespace-nowrap border-r-4 border-amber-600 shadow-xl tracking-wider">
            <Info className="w-8 h-8 animate-pulse" />
            {systemName} SHOWCASE
          </div>
          <div className="flex-1 relative overflow-hidden flex items-center">
            <p 
              className="absolute whitespace-nowrap text-3xl lg:text-4xl font-black animate-marquee w-full text-left tracking-wider"
              style={{ animationDuration: `${parseInt(tickerSpeed) || DEFAULT_TICKER_SPEED}s` }}
            >
              {tickerText || DEFAULT_TICKER}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
