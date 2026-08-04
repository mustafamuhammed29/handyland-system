import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wrench, Battery, Smartphone, Cpu, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { HandylandHeader } from '../common/HandylandHeader';
import { TVScreenControls } from '../common/TVScreenControls';
import { TVBackControl } from '../common/TVBackControl';
import { isVideoMedia, getMediaSrc } from '../../utils/mediaHelpers';

const goldTextGradient = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600";
const darkBg = "bg-[#050505]";

export const ScreenRepairs = ({ 
  repairs, repairPrices = [], customLogo, headerSubtitle, 
  slideInterval = 6, cityName, onBack, t, lang, isOffline 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  const handleNextSlide = useCallback(() => {
    if (repairs.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % repairs.length);
  }, [repairs.length]);

  const handlePrevSlide = useCallback(() => {
    if (repairs.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + repairs.length) % repairs.length);
  }, [repairs.length]);

  // دعم أزرار الريموت كنترول للأسهم والتنقل
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'MediaTrackNext') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'MediaTrackPrevious') {
        handlePrevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextSlide, handlePrevSlide]);

  // تحديث فوري للمؤشر إذا تم حذف صورة صيانة
  useEffect(() => {
    if (currentIndex >= repairs.length && repairs.length > 0) {
      setCurrentIndex(0);
    }
  }, [repairs.length, currentIndex]);

  const currentItem = repairs[currentIndex % repairs.length];
  const isCurrentVideo = currentItem ? isVideoMedia(currentItem.imageData) : false;

  useEffect(() => {
    if (repairs.length <= 1) return;

    if (!isCurrentVideo) {
      const intervalMs = Math.max(2, parseInt(slideInterval) || 6) * 1000;
      const timer = setTimeout(handleNextSlide, intervalMs);
      return () => clearTimeout(timer);
    } else {
      const safetyTimer = setTimeout(handleNextSlide, 60000);
      return () => clearTimeout(safetyTimer);
    }
  }, [repairs.length, slideInterval, currentIndex, isCurrentVideo, handleNextSlide]);

  return (
    <div className={`flex flex-col h-screen max-h-screen w-full ${darkBg} text-white overflow-hidden font-sans relative`} dir="ltr">
      <TVScreenControls />
      <TVBackControl onBack={onBack} t={t} />
      <HandylandHeader title="Reparaturzentrum & Preise" icon={Wrench} customLogo={customLogo} headerSubtitle={headerSubtitle} cityName={cityName} lang={lang} isOffline={isOffline} />

      <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col relative min-h-0 pt-24 lg:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full z-10 min-h-0">
          
          <div className="lg:col-span-4 flex flex-col justify-between bg-gradient-to-b from-black/95 via-gray-950/90 to-black/95 rounded-3xl border-2 border-yellow-500/40 p-5 lg:p-6 shadow-2xl backdrop-blur-xl h-full min-h-0 overflow-hidden">
            
            <div className="flex flex-col items-center text-center pt-1">
              <div className="relative mb-3 p-1 bg-white rounded-full border-4 border-yellow-400 shadow-[0_0_35px_rgba(234,179,8,0.5)] flex items-center justify-center w-28 h-28 lg:w-36 lg:h-36 overflow-hidden">
                 {customLogo ? (
                   <img src={customLogo} alt="Shop Logo" className="w-full h-full object-contain rounded-full p-1" />
                 ) : (
                   <div className="relative w-full h-full flex items-center justify-center bg-black rounded-full">
                     <Smartphone className="w-14 h-14 lg:w-16 lg:h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                     <Wrench className="w-14 h-14 lg:w-16 lg:h-16 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] absolute" />
                   </div>
                 )}
              </div>

              <h2 className={`text-2xl lg:text-3xl font-black text-center leading-tight mb-1 ${goldTextGradient} tracking-wide`}>
                Express Reparatur
              </h2>
              <p className="text-yellow-400/80 text-xs lg:text-sm font-semibold tracking-wider uppercase">Mit Garantie • Vor-Ort</p>
            </div>

            {/* قائمة الأسعار والخدمات المباشرة */}
            <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-2.5 max-h-[300px] lg:max-h-[400px]">
              {repairPrices && repairPrices.length > 0 ? (
                repairPrices.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 p-3 rounded-2xl transition">
                    <div>
                      <div className="font-extrabold text-sm text-white">{item.device_model}</div>
                      <div className="text-xs text-yellow-400/90 font-medium">{item.service_name}</div>
                    </div>
                    <div className="bg-yellow-500 text-black px-3 py-1 rounded-xl font-black text-sm shadow-md">
                      {item.price}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-2 gap-3 text-gray-100 text-sm lg:text-base font-extrabold my-auto">
                  <div className="flex flex-col items-center justify-center gap-2 bg-black/80 p-3 rounded-2xl border border-yellow-500/30 shadow-lg text-center">
                    <Battery className="w-8 h-8 text-yellow-400"/>
                    <span>Akkus</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 bg-black/80 p-3 rounded-2xl border border-yellow-500/30 shadow-lg text-center">
                    <Smartphone className="w-8 h-8 text-yellow-400"/>
                    <span>Displays</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 bg-black/80 p-3 rounded-2xl border border-yellow-500/30 shadow-lg text-center">
                    <Cpu className="w-8 h-8 text-yellow-400"/>
                    <span>Platinen</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 bg-black/80 p-3 rounded-2xl border border-yellow-500/30 shadow-lg text-center">
                    <Zap className="w-8 h-8 text-yellow-400"/>
                    <span>Ladebuchsen</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-8 bg-black/80 rounded-3xl border-2 border-yellow-500/30 p-3 lg:p-4 flex flex-col h-full overflow-hidden shadow-2xl backdrop-blur-xl min-h-0 relative justify-center items-center">
            
            {repairs.length > 1 && (
              <>
                <button 
                  onClick={handlePrevSlide}
                  className="absolute left-4 z-40 bg-black/50 hover:bg-yellow-500 hover:text-black text-yellow-400 p-3 rounded-full border border-yellow-500/30 backdrop-blur-md transition-all shadow-2xl opacity-30 hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleNextSlide}
                  className="absolute right-4 z-40 bg-black/50 hover:bg-yellow-500 hover:text-black text-yellow-400 p-3 rounded-full border border-yellow-500/30 backdrop-blur-md transition-all shadow-2xl opacity-30 hover:opacity-100 cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {repairs.length === 0 ? (
              <div className="text-3xl text-gray-400 font-light">Warten auf Reparatur-Plakat...</div>
            ) : (
              repairs.map((item, index) => {
                const isVideo = isVideoMedia(item.imageData);
                const mediaSrc = getMediaSrc(item.imageData);
                const isCurrent = index === (currentIndex % repairs.length);

                return (
                  <div 
                    key={item.id} 
                    className={`absolute inset-0 transition-all duration-1000 transform flex items-center justify-center p-2 ${
                      isCurrent ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
                    }`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                      {isVideo ? (
                        <video 
                          key={`bg-rep-${item.id}`}
                          src={mediaSrc} 
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-2xl"
                          style={{ filter: 'blur(40px) brightness(0.7) saturate(1.4)', transform: 'scale(2)', opacity: 1 }}
                        />
                      ) : (
                        <img 
                          src={mediaSrc} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-2xl"
                          style={{ filter: 'blur(40px) brightness(0.7) saturate(1.4)', transform: 'scale(2)', opacity: 1 }}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 pointer-events-none rounded-2xl" />

                      {isVideo ? (
                        <video 
                          ref={isCurrent ? videoRef : null}
                          key={`fg-rep-${item.id}`}
                          src={mediaSrc} 
                          autoPlay={isCurrent}
                          muted
                          playsInline
                          onEnded={handleNextSlide}
                          className="relative z-10 max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                        />
                      ) : (
                        <img 
                          src={mediaSrc} 
                          alt="Repair Poster" 
                          className="relative z-10 max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {repairs.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-3">
                {repairs.map((_, index) => (
                   <div 
                     key={index} 
                     onClick={() => setCurrentIndex(index)}
                     className={`h-2.5 rounded-full transition-all duration-500 shadow-xl cursor-pointer ${
                       index === (currentIndex % repairs.length) ? 'w-16 bg-yellow-400' : 'w-4 bg-gray-800 hover:bg-gray-700'
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
