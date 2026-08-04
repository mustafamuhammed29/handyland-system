import React from 'react';
import { Languages } from 'lucide-react';

export const LanguageToggle = ({ lang, setLang }) => (
  <button 
    onClick={() => setLang(lang === 'de' ? 'ar' : 'de')}
    className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500 hover:text-black text-yellow-400 px-4 py-2 rounded-2xl border border-yellow-500/30 backdrop-blur-md transition-all shadow-md font-bold text-sm lg:text-base cursor-pointer"
    title="Sprache wechseln / تغيير اللغة"
  >
    <Languages className="w-5 h-5" />
    <span>{lang === 'de' ? '🇩🇪 Deutsch' : '🇸🇦 العربية'}</span>
  </button>
);
