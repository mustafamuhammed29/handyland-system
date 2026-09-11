import React from 'react';
import { Globe, WifiOff } from 'lucide-react';
import { LiveClockWeatherWidget } from './LiveClockWeatherWidget';
import { DEFAULT_SUBTITLE } from '../../constants/defaults';

const goldTextGradient = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600";

export const HandylandHeader = ({ 
  title, icon: Icon, customLogo, headerSubtitle, 
  cityName, lang, isOffline, systemName = "HANDYLAND" 
}) => {
  const isAlsafi = systemName === 'ALSAFI';
  const isKanka = systemName === 'KANKA';
  const isHsp = systemName === 'HSP';

  const brandGradient = isHsp
    ? "text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-rose-400 to-pink-500"
    : isAlsafi
    ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-orange-400 to-amber-500"
    : isKanka
    ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-400 to-yellow-500"
    : "text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-400 to-yellow-600";

  const borderColor = isHsp
    ? "border-rose-500/30"
    : isAlsafi
    ? "border-orange-500/30"
    : "border-yellow-500/30";

  const logoBorder = isHsp
    ? "border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
    : isAlsafi
    ? "border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
    : "border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.6)]";

  const iconColor = isHsp
    ? "text-rose-400"
    : isAlsafi
    ? "text-orange-400"
    : "text-yellow-400";

  const subtitleBadge = isHsp
    ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
    : isAlsafi
    ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
    : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400/90";

  return (
    <header className={`relative w-full px-6 lg:px-10 py-3.5 bg-black/85 border-b ${borderColor} flex justify-between items-center z-40 backdrop-blur-md pl-16 lg:pl-20 pr-16 lg:pr-24 shadow-2xl h-20 lg:h-24 shrink-0`}>
      <div className="flex items-center gap-3 lg:gap-5 z-10 min-w-0 flex-1">
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {customLogo ? (
            <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 p-0.5 bg-white flex items-center justify-center ${logoBorder}`}>
              <img src={customLogo} alt={`${systemName} Logo`} className="w-full h-full object-contain rounded-full" />
            </div>
          ) : (
            <Globe className={`w-10 h-10 lg:w-12 lg:h-12 ${iconColor} drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]`} />
          )}
          <span className={`text-2xl lg:text-4xl font-black tracking-widest ${brandGradient} drop-shadow-md`}>{systemName}</span>
        </div>
        <div className={`h-8 w-0.5 ${borderColor} shrink-0`} />
        <h1 className="text-base lg:text-xl font-extrabold text-white flex items-center gap-2 tracking-wide truncate shrink-0">
          {Icon && <Icon className={`w-5 h-5 lg:w-7 lg:h-7 ${iconColor} shrink-0`} />}
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
        <div className={`hidden lg:flex text-sm lg:text-lg font-semibold tracking-wider z-10 uppercase items-center gap-2.5 px-5 py-2 rounded-xl border ${subtitleBadge}`}>
          <span className="w-3 h-3 rounded-full bg-green-500 animate-ping" />
          {headerSubtitle || DEFAULT_SUBTITLE}
        </div>
      </div>
    </header>
  );
};
