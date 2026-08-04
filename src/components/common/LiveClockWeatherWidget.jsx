import React, { useState, useEffect } from 'react';
import { Clock, Sun, CloudSun, CloudRain, Snowflake, CloudLightning } from 'lucide-react';

export const LiveClockWeatherWidget = ({ cityName = 'Heidelberg', lang, isOffline }) => {
  const [time, setTime] = useState(new Date());
  const [temp, setTemp] = useState(null);
  const [weatherCode, setWeatherCode] = useState(0);

  // 1. تحديث الساعة بالثواني
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. جلب حالة الطقس الحقيقية من API لمدينة المحل
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      if (isOffline) return;
      try {
        const targetCity = cityName.trim() || 'Heidelberg';
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetCity)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (geoData?.results?.[0]) {
          const { latitude, longitude } = geoData.results[0];
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          
          if (weatherData?.current_weather && isMounted) {
            setTemp(Math.round(weatherData.current_weather.temperature));
            setWeatherCode(weatherData.current_weather.weathercode);
          }
        }
      } catch (err) {
        console.warn("Weather API notice:", err);
      }
    };

    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 900000); // تحديث كل 15 دقيقة
    return () => { isMounted = false; clearInterval(weatherTimer); };
  }, [cityName, isOffline]);

  const timeStr = time.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'de-DE', { weekday: 'short', day: 'numeric', month: 'short' });

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="w-5 h-5 text-yellow-400 animate-spin-slow" />;
    if (code >= 1 && code <= 3) return <CloudSun className="w-5 h-5 text-yellow-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (code >= 71 && code <= 86) return <Snowflake className="w-5 h-5 text-cyan-300" />;
    if (code >= 95) return <CloudLightning className="w-5 h-5 text-yellow-500" />;
    return <CloudSun className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div className="flex items-center gap-3 bg-black/60 px-4 py-1.5 rounded-2xl border border-yellow-500/30 text-yellow-400 font-bold backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-2 border-r border-yellow-500/20 pr-3">
        <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
        <div className="flex flex-col text-right leading-none">
          <span className="text-base font-black tracking-wider text-white">{timeStr}</span>
          <span className="text-[10px] text-yellow-400/80 uppercase">{dateStr}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 pl-1">
        {getWeatherIcon(weatherCode)}
        <span className="text-xs font-semibold text-gray-200">
          {cityName || 'Heidelberg'} {temp !== null ? `${temp}°C` : ''}
        </span>
      </div>
    </div>
  );
};
