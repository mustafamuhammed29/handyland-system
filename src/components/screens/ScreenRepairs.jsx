import React, { useState, useEffect } from 'react';
import { Wrench, Battery, Smartphone, Cpu, Zap } from 'lucide-react';
import { HandylandHeader } from '../common/HandylandHeader';
import { TVScreenControls } from '../common/TVScreenControls';
import { TVBackControl } from '../common/TVBackControl';
import { isVideoMedia } from '../../utils/mediaHelpers';

const goldTextGradient = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600";
const darkBg = "bg-[#050505]";

export const ScreenRepairs = ({ repairs, customLogo, headerSubtitle, slideInterval = 6, cityName, onBack, t, lang, isOffline }) => {
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
      <HandylandHeader title="Reparaturzentrum & Preise" icon={Wrench} customLogo={customLogo} headerSubtitle={headerSubtitle} cityName={cityName} lang={lang} isOffline={isOffline} />

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
              repairs.map((item, index) => {
                const isVideo = isVideoMedia(item.imageData);
                const isCurrent = index === (currentIndex % repairs.length);

                return (
                  <div 
                    key={item.id} 
                    className={`absolute inset-0 transition-all duration-1000 transform flex items-center justify-center p-2 ${
                      isCurrent ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'
                    }`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                      {!isVideo && (
                        <img 
                          src={item.imageData} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-2xl"
                          style={{ filter: 'blur(40px) brightness(0.7) saturate(1.4)', transform: 'scale(2)', opacity: 1 }}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 pointer-events-none rounded-2xl" />

                      {isVideo ? (
                        <video 
                          src={item.imageData} 
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="relative z-10 max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                        />
                      ) : (
                        <img 
                          src={item.imageData} 
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
