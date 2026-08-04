import React from 'react';
import { Globe, WifiOff } from 'lucide-react';
import { LiveClockWeatherWidget } from './LiveClockWeatherWidget';
import { DEFAULT_SUBTITLE } from '../../constants/defaults';

const goldTextGradient = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600";

export const HandylandHeader = ({ title, icon: Icon, customLogo, headerSubtitle, cityName, lang, isOffline }) => (
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
      {isOffline && (
        <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-xl border border-red-500/40 text-xs font-bold animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </div>
      )}
      <LiveClockWeatherWidget cityName={cityName} lang={lang} isOffline={isOffline} />
      <div className="hidden lg:flex text-sm lg:text-lg text-yellow-400/90 font-semibold tracking-wider z-10 uppercase items-center gap-2.5 bg-yellow-500/10 px-5 py-2 rounded-xl border border-yellow-500/30">
        <span className="w-3 h-3 rounded-full bg-green-500 animate-ping"></span>
        {headerSubtitle || DEFAULT_SUBTITLE}
      </div>
    </div>
  </header>
);
