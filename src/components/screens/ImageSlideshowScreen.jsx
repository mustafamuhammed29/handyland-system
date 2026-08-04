import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Info, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { HandylandHeader } from '../common/HandylandHeader';
import { TVScreenControls } from '../common/TVScreenControls';
import { TVBackControl } from '../common/TVBackControl';
import { isVideoMedia, getMediaSrc } from '../../utils/mediaHelpers';
import { DEFAULT_TICKER, DEFAULT_TICKER_SPEED } from '../../constants/defaults';

const goldTextGradient = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600";
const darkBg = "bg-[#050505]";

export const ImageSlideshowScreen = ({ 
  items, title, icon, showNewsTicker = false, customLogo, 
  tickerText, tickerSpeed = DEFAULT_TICKER_SPEED, headerSubtitle, 
  slideInterval = 6, cityName, onBack, t, lang, isOffline 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef(null);

  const handleNextSlide = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrevSlide = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
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

  // تحديث فوري للمؤشر إذا تم حذف عنصر من القائمة
  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  const currentItem = items[currentIndex % items.length];
  const isCurrentVideo = currentItem ? isVideoMedia(currentItem.imageData) : false;

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    if (!isCurrentVideo) {
      const intervalMs = Math.max(2, parseInt(slideInterval) || 6) * 1000;
      const timer = setTimeout(handleNextSlide, intervalMs);
      return () => clearTimeout(timer);
    } else {
      const safetyTimer = setTimeout(handleNextSlide, 60000);
      return () => clearTimeout(safetyTimer);
    }
  }, [items.length, slideInterval, currentIndex, isCurrentVideo, isPaused, handleNextSlide]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#050505] text-white font-sans relative overflow-hidden" dir="ltr">
        <TVScreenControls />
        <TVBackControl onBack={onBack} t={t} />
        <span className={`text-6xl lg:text-8xl font-black tracking-widest mb-6 ${goldTextGradient} animate-pulse`}>HANDYLAND</span>
        <div className="text-2xl lg:text-4xl text-gray-400 font-light bg-black/60 px-10 py-5 rounded-3xl border border-yellow-500/20 backdrop-blur-md">
          Warten auf Medien... (Keine Plakate/Videos hochgeladen)
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen max-h-screen w-full ${darkBg} text-white overflow-hidden font-sans relative`} dir="ltr">
      <TVScreenControls />
      <TVBackControl onBack={onBack} t={t} />
      <HandylandHeader title={title} icon={icon} customLogo={customLogo} headerSubtitle={headerSubtitle} cityName={cityName} lang={lang} isOffline={isOffline} />

      <main className="flex-1 relative bg-black flex items-center justify-center overflow-hidden w-full h-full min-h-0">
        
        {/* أزرار الأسهم الجانبية للريموت كنترول والتنقل اليدوي */}
        {items.length > 1 && (
          <>
            <button 
              onClick={handlePrevSlide}
              className="absolute left-4 z-40 bg-black/50 hover:bg-yellow-500 hover:text-black text-yellow-400 p-4 rounded-full border border-yellow-500/30 backdrop-blur-md transition-all shadow-2xl opacity-30 hover:opacity-100 cursor-pointer"
              title="Vorheriges Medium (Arrow Left)"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={handleNextSlide}
              className="absolute right-4 z-40 bg-black/50 hover:bg-yellow-500 hover:text-black text-yellow-400 p-4 rounded-full border border-yellow-500/30 backdrop-blur-md transition-all shadow-2xl opacity-30 hover:opacity-100 cursor-pointer"
              title="Nächstes Medium (Arrow Right)"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="absolute top-28 right-6 z-40 bg-black/60 text-yellow-400 px-3 py-1.5 rounded-xl border border-yellow-500/30 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 opacity-40 hover:opacity-100 cursor-pointer"
            >
              {isPaused ? <><Play className="w-4 h-4 text-green-400" /> Resume</> : <><Pause className="w-4 h-4 text-yellow-400" /> Pause</>}
            </button>
          </>
        )}

        {items.map((item, index) => {
          const isVideo = isVideoMedia(item.imageData);
          const mediaSrc = getMediaSrc(item.imageData);
          const isCurrent = index === (currentIndex % items.length);

          return (
            <div 
              key={item.id} 
              className={`absolute inset-0 transition-all duration-1000 transform flex items-center justify-center w-full h-full p-2 lg:p-4 ${
                isCurrent ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
               {item.imageData ? (
                 <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {/* طبقة الخلفية الضبابية الجميلة المحيطة بالكامل */}
                    {isVideo ? (
                      <video
                        key={`bg-video-${item.id}`}
                        src={mediaSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{ filter: 'blur(40px) brightness(0.7) saturate(1.4)', transform: 'scale(2)', opacity: 1 }}
                      />
                    ) : (
                      <img 
                        src={mediaSrc} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{ filter: 'blur(40px) brightness(0.7) saturate(1.4)', transform: 'scale(2)', opacity: 1 }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />

                    {/* الوسائط الأصلية الواضحة في المركز */}
                    {isVideo ? (
                      <video
                        ref={isCurrent ? videoRef : null}
                        key={`fg-video-${item.id}`}
                        src={mediaSrc}
                        autoPlay={isCurrent && !isPaused}
                        muted
                        playsInline
                        onEnded={handleNextSlide}
                        className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] rounded-2xl"
                      />
                    ) : (
                      <img 
                        src={mediaSrc} 
                        alt="Poster" 
                        className="relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] rounded-2xl" 
                      />
                    )}
                 </div>
               ) : (
                 <div className="text-4xl text-red-500 font-bold">Medienfehler</div>
               )}
            </div>
          );
        })}

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
