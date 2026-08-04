import React from 'react';
import { Globe, WifiOff } from 'lucide-react';
import { LiveClockWeatherWidget } from './LiveClockWeatherWidget';
import { DEFAULT_SUBTITLE } from '../../constants/defaults';

const goldTextGradient = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600";

export const HandylandHeader = ({ title, icon: Icon, customLogo, headerSubtitle, cityName, lang, isOffline, systemName = "HANDYLAND" }) => (
  <header className="relative w-full px-6 lg:px-10 py-3.5 bg-black/80 border-b border-yellow-500/30 flex justify-between items-center z-40 backdrop-blur-md pl-16 lg:pl-20 pr-16 lg:pr-24 shadow-2xl h-20 lg:h-24 shrink-0">
    <div className="flex items-center gap-3 lg:gap-5 z-10 min-w-0 flex-1">
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        {customLogo ? (
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 border-yellow-400 p-0.5 bg-white flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.6)]">
            <img src={customLogo} alt={`${systemName} Logo`} className="w-full h-full object-contain rounded-full" />
          </div>
        ) : (
          <Globe className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
        )}
        <span className={`text-2xl lg:text-4xl font-black tracking-widest ${goldTextGradient} drop-shadow-md`}>{systemName}</span>
      </div>
      <div className="h-8 w-0.5 bg-yellow-500/40 shrink-0"></div>
      <h1 className="text-base lg:text-xl font-extrabold text-white flex items-center gap-2 tracking-wide truncate shrink-0">
        {Icon && <Icon className="w-5 h-5 lg:w-7 lg:h-7 text-yellow-400 shrink-0" />}
        <span className="truncate">{title}</span>
      </h1>
    </div>

    <div className="hidden sm:flex items-center gap-4 shrink-0">
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
