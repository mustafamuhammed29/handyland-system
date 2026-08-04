import React from 'react';
import { Smartphone, Wrench, Tag, Settings, Lock, Globe, Utensils, Coffee, Percent } from 'lucide-react';
import { TVScreenControls } from '../common/TVScreenControls';
import { LanguageToggle } from '../common/LanguageToggle';

const goldTextGradient = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600";

export const MainMenu = ({ 
  navigateTo, customLogo, lang, setLang, t, 
  showPinModal, setShowPinModal, handleVerifyPin 
}) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 md:p-12 text-white font-sans relative overflow-hidden" dir={dir}>
      <TVScreenControls />

      <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #fbbf24 2px, transparent 2px)', backgroundSize: '50px 50px' }}></div>

      <div className="absolute top-6 left-6 z-20">
        <LanguageToggle lang={lang} setLang={setLang} />
      </div>

      <div className="text-center mb-16 relative z-10">
        <div className="mb-6 inline-block bg-white p-1 rounded-full border-4 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.5)] w-48 h-48 lg:w-60 lg:h-60 overflow-hidden">
           <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
             <img src="./logo.png" alt="JansaTech Logo" className="w-full h-full object-contain" />
           </div>
        </div>
        <h1 className={`text-6xl md:text-8xl font-black mb-6 tracking-widest uppercase ${goldTextGradient} drop-shadow-2xl`}>
          JansaTech
        </h1>
        <p className="text-gray-300 text-2xl font-light tracking-wide bg-black/60 px-8 py-3 rounded-full border border-yellow-500/30 backdrop-blur-md inline-block">
          {t.systemTitle}
        </p>
      </div>

      <div className="flex flex-col gap-12 max-w-7xl w-full relative z-10">
        
        {/* Handyland Section */}
        <div className="bg-black/40 p-8 rounded-[3rem] border border-yellow-500/20 backdrop-blur-md">
          <h2 className="text-3xl font-black text-yellow-400 mb-8 flex items-center gap-3">
            <Smartphone className="w-8 h-8" />
            {lang === 'ar' ? 'شاشات عرض الهواتف (Handyland)' : 'Handyland Bildschirme'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={() => navigateTo('screen1')} className="group bg-black/90 hover:bg-black border-2 border-yellow-500/40 hover:border-yellow-400 rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl cursor-pointer">
              <div className="bg-yellow-500/10 group-hover:bg-yellow-500 p-6 rounded-full mb-6 transition-colors border border-yellow-500/20 shadow-inner">
                 <Smartphone className="w-12 h-12 text-yellow-400 group-hover:text-black" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black mb-2 text-white leading-tight px-2 break-words w-full text-center">{t.screen1Title}</h2>
              <p className="text-yellow-400 font-bold tracking-wider uppercase text-sm lg:text-base">{t.screen1Sub}</p>
            </button>

            <button onClick={() => navigateTo('screen2')} className="group bg-black/90 hover:bg-black border-2 border-yellow-500/40 hover:border-yellow-400 rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl cursor-pointer">
              <div className="bg-yellow-500/10 group-hover:bg-yellow-500 p-6 rounded-full mb-6 transition-colors border border-yellow-500/20 shadow-inner">
                <Wrench className="w-12 h-12 text-yellow-400 group-hover:text-black" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black mb-2 text-white leading-tight px-2 break-words w-full text-center">{t.screen2Title}</h2>
              <p className="text-yellow-400 font-bold tracking-wider uppercase text-sm lg:text-base">{t.screen2Sub}</p>
            </button>

            <button onClick={() => navigateTo('screen3')} className="group bg-black/90 hover:bg-black border-2 border-yellow-500/40 hover:border-yellow-400 rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl cursor-pointer">
              <div className="bg-yellow-500/10 group-hover:bg-yellow-500 p-6 rounded-full mb-6 transition-colors border border-yellow-500/20 shadow-inner">
                <Tag className="w-12 h-12 text-yellow-400 group-hover:text-black" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black mb-2 text-white leading-tight px-2 break-words w-full text-center">{t.screen3Title}</h2>
              <p className="text-yellow-400 font-bold tracking-wider uppercase text-sm lg:text-base">{t.screen3Sub}</p>
            </button>
          </div>
        </div>

        {/* Alsafi Section */}
        <div className="bg-black/40 p-8 rounded-[3rem] border border-orange-500/20 backdrop-blur-md">
          <h2 className="text-3xl font-black text-orange-400 mb-8 flex items-center gap-3">
            <Utensils className="w-8 h-8" />
            {lang === 'ar' ? 'شاشات عرض المطعم (Alsafi)' : 'Alsafi Restaurant Bildschirme'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={() => navigateTo('alsafi-screen1')} className="group bg-black/90 hover:bg-black border-2 border-orange-500/40 hover:border-orange-400 rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl cursor-pointer">
              <div className="bg-orange-500/10 group-hover:bg-orange-500 p-6 rounded-full mb-6 transition-colors border border-orange-500/20 shadow-inner">
                 <Utensils className="w-12 h-12 text-orange-400 group-hover:text-black" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black mb-2 text-white leading-tight px-2 break-words w-full text-center">{lang === 'ar' ? 'المنيو الرئيسي' : 'Hauptmenü'}</h2>
              <p className="text-orange-400 font-bold tracking-wider uppercase text-sm lg:text-base">{lang === 'ar' ? 'وجبات المطعم' : 'Mahlzeiten'}</p>
            </button>

            <button onClick={() => navigateTo('alsafi-screen2')} className="group bg-black/90 hover:bg-black border-2 border-orange-500/40 hover:border-orange-400 rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl cursor-pointer">
              <div className="bg-orange-500/10 group-hover:bg-orange-500 p-6 rounded-full mb-6 transition-colors border border-orange-500/20 shadow-inner">
                <Coffee className="w-12 h-12 text-orange-400 group-hover:text-black" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black mb-2 text-white leading-tight px-2 break-words w-full text-center">{lang === 'ar' ? 'المشروبات' : 'Getränke'}</h2>
              <p className="text-orange-400 font-bold tracking-wider uppercase text-sm lg:text-base">{lang === 'ar' ? 'عصائر ومشروبات ساخنة' : 'Kalt & Heiß'}</p>
            </button>

            <button onClick={() => navigateTo('alsafi-screen3')} className="group bg-black/90 hover:bg-black border-2 border-orange-500/40 hover:border-orange-400 rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-2xl backdrop-blur-xl cursor-pointer">
              <div className="bg-orange-500/10 group-hover:bg-orange-500 p-6 rounded-full mb-6 transition-colors border border-orange-500/20 shadow-inner">
                <Percent className="w-12 h-12 text-orange-400 group-hover:text-black" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black mb-2 text-white leading-tight px-2 break-words w-full text-center">{lang === 'ar' ? 'عروض المطعم' : 'Restaurant Angebote'}</h2>
              <p className="text-orange-400 font-bold tracking-wider uppercase text-sm lg:text-base">{lang === 'ar' ? 'خصومات وعروض مميزة' : 'Sonderangebote'}</p>
            </button>
          </div>
        </div>

        {/* Unified Admin Gateway Button */}
        <div className="flex justify-center mt-6">
          <button onClick={() => navigateTo('admin-gateway')} className="group bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 border-2 border-yellow-300 rounded-[2.5rem] px-16 py-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(234,179,8,0.4)] relative cursor-pointer">
            <div className="absolute top-4 right-4 bg-black/60 p-2 rounded-full border border-yellow-400/40">
              <Lock className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="bg-black p-6 rounded-full mb-4 transition-colors shadow-2xl flex items-center justify-center gap-4">
              <Smartphone className="w-10 h-10 text-yellow-400" />
              <div className="w-1 h-10 bg-yellow-600/50 rounded-full"></div>
              <Utensils className="w-10 h-10 text-orange-400" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black mb-2 text-black leading-tight px-2 break-words w-full text-center">
              {lang === 'ar' ? 'بوابة الإدارة الموحدة' : 'Zentrales Verwaltungsportal'}
            </h2>
            <p className="text-black/80 font-extrabold text-base lg:text-lg leading-snug">
              {lang === 'ar' ? 'إدارة الهواتف والمطعم' : 'Handys & Restaurant verwalten'}
            </p>
          </button>
        </div>

      </div>
    </div>
  );
};
