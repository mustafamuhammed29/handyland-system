import React from 'react';
import { Smartphone, Utensils, Flame, Scissors, Lock, ChevronRight, ArrowLeft } from 'lucide-react';

export const AdminGateway = ({ onBranchSelect, onBack, lang }) => {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 md:p-12 text-white font-sans relative overflow-hidden" dir={dir}>
      
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full backdrop-blur-md transition-all border border-white/10 z-50 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-bold text-lg">{isAr ? 'عودة' : 'Zurück'}</span>
      </button>

      <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #fbbf24 2px, transparent 2px)', backgroundSize: '50px 50px' }}></div>

      <div className="text-center mb-12 relative z-10 max-w-2xl mx-auto">
        <div className="mb-6 inline-block bg-black p-4 rounded-full border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
          <Lock className="w-14 h-14 text-yellow-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600">
          {isAr ? 'بوابة الإدارة الموحدة' : 'Zentrales Verwaltungsportal'}
        </h1>
        <p className="text-gray-400 text-base md:text-lg font-light">
          {isAr ? 'الرجاء اختيار الفرع المطلوب للدخول إلى لوحة التحكم والتحليلات' : 'Bitte wählen Sie die geschützte Filiale zur Verwaltung'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full relative z-10 mb-4">
        
        {/* Handyland Branch */}
        <button 
          onClick={() => onBranchSelect('handyland')}
          className="group bg-gradient-to-br from-gray-900 to-black hover:from-black hover:to-gray-900 border-2 border-yellow-500/30 hover:border-yellow-400 rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 shadow-2xl cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-transparent transition-colors"></div>
          <div className="bg-yellow-500/10 group-hover:bg-yellow-500 p-5 rounded-full mb-5 transition-colors border border-yellow-500/20 shadow-inner z-10">
            <Smartphone className="w-10 h-10 text-yellow-400 group-hover:text-black" />
          </div>
          <h2 className="text-xl font-black mb-2 text-white z-10">HANDYLAND</h2>
          <p className="text-yellow-500/80 font-bold tracking-wide uppercase text-xs mb-5 z-10">
            {isAr ? 'شاشات الهواتف والتحليلات' : 'Smartphones & Analytics'}
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-full group-hover:bg-yellow-400 group-hover:text-black transition-colors z-10 font-bold text-xs mt-auto">
            <span>{isAr ? 'دخول برمز PIN' : 'PIN-Zugang'}</span>
            <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Alsafi Restaurant Branch */}
        <button 
          onClick={() => onBranchSelect('alsafi')}
          className="group bg-gradient-to-br from-gray-900 to-black hover:from-black hover:to-gray-900 border-2 border-orange-500/30 hover:border-orange-400 rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 shadow-2xl cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-transparent transition-colors"></div>
          <div className="bg-orange-500/10 group-hover:bg-orange-500 p-5 rounded-full mb-5 transition-colors border border-orange-500/20 shadow-inner z-10">
            <Utensils className="w-10 h-10 text-orange-400 group-hover:text-white" />
          </div>
          <h2 className="text-xl font-black mb-2 text-white z-10">ALSAFI</h2>
          <p className="text-orange-500/80 font-bold tracking-wide uppercase text-xs mb-5 z-10">
            {isAr ? 'شاشات المطعم والتحليلات' : 'Restaurant & Analytics'}
          </p>
          <div className="flex items-center justify-center gap-2 text-orange-400 bg-orange-400/10 px-4 py-2 rounded-full group-hover:bg-orange-500 group-hover:text-white transition-colors z-10 font-bold text-xs mt-auto">
            <span>{isAr ? 'دخول برمز PIN' : 'PIN-Zugang'}</span>
            <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Kanka Orient Deluxe Branch */}
        <button 
          onClick={() => onBranchSelect('kanka')}
          className="group bg-gradient-to-br from-gray-900 to-black hover:from-black hover:to-gray-900 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 shadow-2xl cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-transparent transition-colors"></div>
          <div className="bg-amber-500/10 group-hover:bg-amber-500 p-5 rounded-full mb-5 transition-colors border border-amber-500/20 shadow-inner z-10">
            <Flame className="w-10 h-10 text-amber-400 group-hover:text-black" />
          </div>
          <h2 className="text-xl font-black mb-2 text-white z-10">KANKA</h2>
          <p className="text-amber-400 font-bold tracking-wide uppercase text-xs mb-5 z-10">
            {isAr ? 'كافتيريا وشيشة لاونج' : 'Shisha Lounge & Café'}
          </p>
          <div className="flex items-center justify-center gap-2 text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full group-hover:bg-amber-400 group-hover:text-black transition-colors z-10 font-bold text-xs mt-auto">
            <span>{isAr ? 'دخول برمز PIN' : 'PIN-Zugang'}</span>
            <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* HSP Hair & Beauty Branch */}
        <button 
          onClick={() => onBranchSelect('hsp')}
          className="group bg-gradient-to-br from-gray-900 to-black hover:from-black hover:to-gray-900 border-2 border-[#C49A6C]/40 hover:border-[#D2B48C] rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 shadow-2xl cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#C49A6C]/5 group-hover:bg-transparent transition-colors"></div>
          <div className="bg-[#C49A6C]/10 group-hover:bg-[#C49A6C] p-5 rounded-full mb-5 transition-colors border border-[#C49A6C]/20 shadow-inner z-10">
            <Scissors className="w-10 h-10 text-[#D2B48C] group-hover:text-black" />
          </div>
          <h2 className="text-xl font-black mb-2 text-white z-10">HSP</h2>
          <p className="text-[#D2B48C] font-bold tracking-wide uppercase text-xs mb-5 z-10">
            {isAr ? 'صالون حلاقة وتجميل' : 'Hair & Beauty Salon'}
          </p>
          <div className="flex items-center justify-center gap-2 text-[#D2B48C] bg-[#C49A6C]/10 px-4 py-2 rounded-full group-hover:bg-[#C49A6C] group-hover:text-black transition-colors z-10 font-bold text-xs mt-auto">
            <span>{isAr ? 'دخول برمز PIN' : 'PIN-Zugang'}</span>
            <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </div>
        </button>

      </div>

    </div>
  );
};
