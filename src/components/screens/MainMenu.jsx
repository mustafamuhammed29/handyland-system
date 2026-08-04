import React from 'react';
import { Smartphone, Wrench, Tag, Settings, Lock, Globe } from 'lucide-react';
import { TVScreenControls } from '../common/TVScreenControls';
import { LanguageToggle } from '../common/LanguageToggle';
import { PinProtectionModal } from '../common/PinProtectionModal';

const goldTextGradient = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600";

export const MainMenu = ({ 
  navigateTo, customLogo, lang, setLang, t, 
  showPinModal, setShowPinModal, handleVerifyPin 
}) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 md:p-12 text-white font-sans relative overflow-hidden" dir={dir}>
      <TVScreenControls />

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
        <LanguageToggle lang={lang} setLang={setLang} />
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
        <button onClick={() => navigateTo('screen1')} className="group bg-black/90 hover:bg-black border-2 border-yellow-500/40 hover:border-yellow-400 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl cursor-pointer">
          <div className="bg-yellow-500/10 group-hover:bg-yellow-500 p-8 rounded-full mb-8 transition-colors border border-yellow-500/20 shadow-inner">
             <Smartphone className="w-16 h-16 text-yellow-400 group-hover:text-black" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black mb-3 text-white leading-tight px-2 break-words w-full text-center">{t.screen1Title}</h2>
          <p className="text-yellow-400 font-bold tracking-wider uppercase text-base lg:text-lg">{t.screen1Sub}</p>
        </button>

        <button onClick={() => navigateTo('screen2')} className="group bg-black/90 hover:bg-black border-2 border-yellow-500/40 hover:border-yellow-400 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl cursor-pointer">
          <div className="bg-yellow-500/10 group-hover:bg-yellow-500 p-8 rounded-full mb-8 transition-colors border border-yellow-500/20 shadow-inner">
            <Wrench className="w-16 h-16 text-yellow-400 group-hover:text-black" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black mb-3 text-white leading-tight px-2 break-words w-full text-center">{t.screen2Title}</h2>
          <p className="text-yellow-400 font-bold tracking-wider uppercase text-base lg:text-lg">{t.screen2Sub}</p>
        </button>

        <button onClick={() => navigateTo('screen3')} className="group bg-black/90 hover:bg-black border-2 border-yellow-500/40 hover:border-yellow-400 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl cursor-pointer">
          <div className="bg-yellow-500/10 group-hover:bg-yellow-500 p-8 rounded-full mb-8 transition-colors border border-yellow-500/20 shadow-inner">
            <Tag className="w-16 h-16 text-yellow-400 group-hover:text-black" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black mb-3 text-white leading-tight px-2 break-words w-full text-center">{t.screen3Title}</h2>
          <p className="text-yellow-400 font-bold tracking-wider uppercase text-base lg:text-lg">{t.screen3Sub}</p>
        </button>

        <button onClick={() => setShowPinModal(true)} className="group bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 border-2 border-yellow-300 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(234,179,8,0.4)] relative cursor-pointer">
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
};
