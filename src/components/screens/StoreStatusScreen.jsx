import React, { useState, useEffect } from 'react';
import { Settings, AlertTriangle, Moon, Coffee, Package, Lock } from 'lucide-react';
import { TVScreenControls } from '../common/TVScreenControls';

const MODE_CONFIGS = {
  maintenance: {
    icon: AlertTriangle,
    color: 'yellow',
    title: 'Wartungsmodus / Maintenance',
    bgClass: 'bg-black',
    borderClass: 'border-yellow-500',
    textClass: 'text-yellow-500',
    shadowClass: 'shadow-[0_0_50px_rgba(234,179,8,0.3)]',
  },
  closed: {
    icon: Moon,
    color: 'red',
    title: 'Geschlossen / Closed',
    bgClass: 'bg-gray-950',
    borderClass: 'border-red-500',
    textClass: 'text-red-500',
    shadowClass: 'shadow-[0_0_50px_rgba(239,68,68,0.3)]',
  },
  lunch: {
    icon: Coffee,
    color: 'orange',
    title: 'Mittagspause / Lunch Break',
    bgClass: 'bg-amber-950',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-500',
    shadowClass: 'shadow-[0_0_50px_rgba(249,115,22,0.3)]',
  },
  inventory: {
    icon: Package,
    color: 'indigo',
    title: 'Inventur / Inventory',
    bgClass: 'bg-indigo-950',
    borderClass: 'border-indigo-500',
    textClass: 'text-indigo-500',
    shadowClass: 'shadow-[0_0_50px_rgba(99,102,241,0.3)]',
  }
};

export const StoreStatusScreen = ({ lang, customLogo, storeStatusMode, maintenanceMessage, statusTimerTarget }) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const modeConfig = MODE_CONFIGS[storeStatusMode] || MODE_CONFIGS.maintenance;
  const IconComponent = modeConfig.icon;

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!statusTimerTarget) {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const target = new Date(statusTimerTarget).getTime();
      const now = new Date().getTime();
      const distance = target - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [statusTimerTarget]);

  return (
    <div className={`min-h-screen ${modeConfig.bgClass} flex flex-col items-center justify-center p-8 text-center`} dir={dir}>
      <TVScreenControls lang={lang} />
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none overflow-hidden">
        <div className="w-[100vw] h-[100vh] bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#333_20px,#333_40px)] animate-[bg-scroll_10s_linear_infinite]" />
      </div>

      <div className={`z-10 bg-gray-900/80 p-12 rounded-3xl border-2 ${modeConfig.borderClass} ${modeConfig.shadowClass} max-w-2xl w-full backdrop-blur-sm transition-all duration-1000`}>
        {customLogo ? (
          <img src={customLogo} alt="Logo" className="h-32 mx-auto mb-8 object-contain" />
        ) : (
          <Settings className={`w-24 h-24 ${modeConfig.textClass} mx-auto mb-8 animate-spin-slow`} style={{ animationDuration: '4s' }} />
        )}
        
        <h1 className={`text-4xl md:text-5xl font-black ${modeConfig.textClass} mb-6 flex items-center justify-center gap-4`}>
          <IconComponent className="w-12 h-12" />
          {modeConfig.title}
        </h1>
        
        <p className="text-2xl text-gray-300 font-bold leading-relaxed whitespace-pre-wrap">
          {maintenanceMessage || 'Wir sind bald wieder für Sie da.'}
        </p>

        {timeLeft && (
          <div className="mt-8 bg-black/50 p-6 rounded-2xl border border-gray-700">
            <p className="text-gray-400 text-lg mb-2 font-semibold">
              {lang === 'ar' ? 'نعود بعد:' : 'Wir sind zurück in:'}
            </p>
            <div className={`text-6xl font-black ${modeConfig.textClass} font-mono tracking-wider drop-shadow-lg`}>
              {timeLeft}
            </div>
          </div>
        )}

        {!timeLeft && (
          <div className="mt-12 flex justify-center gap-4">
            <div className={`w-4 h-4 ${modeConfig.bgClass.replace('bg-', 'bg-').replace('950', '500')} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
            <div className={`w-4 h-4 ${modeConfig.bgClass.replace('bg-', 'bg-').replace('950', '500')} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
            <div className={`w-4 h-4 ${modeConfig.bgClass.replace('bg-', 'bg-').replace('950', '500')} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bg-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 56px 0; }
        }
      `}} />
    </div>
  );
};
