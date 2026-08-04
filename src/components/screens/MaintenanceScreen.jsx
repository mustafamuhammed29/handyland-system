import React from 'react';
import { Settings, AlertTriangle } from 'lucide-react';

export const MaintenanceScreen = ({ t, lang, customLogo }) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center" dir={dir}>
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none overflow-hidden">
        <div className="w-[100vw] h-[100vh] bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#333_20px,#333_40px)] animate-[bg-scroll_10s_linear_infinite]" />
      </div>

      <div className="z-10 bg-gray-900/80 p-12 rounded-3xl border-2 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)] max-w-2xl w-full backdrop-blur-sm">
        {customLogo ? (
          <img src={customLogo} alt="Logo" className="h-32 mx-auto mb-8 object-contain" />
        ) : (
          <Settings className="w-24 h-24 text-yellow-500 mx-auto mb-8 animate-spin-slow" style={{ animationDuration: '4s' }} />
        )}
        
        <h1 className="text-5xl font-black text-yellow-500 mb-6 flex items-center justify-center gap-4">
          <AlertTriangle className="w-12 h-12" />
          {t?.maintenanceTitle || 'Maintenance Mode'}
        </h1>
        
        <p className="text-2xl text-gray-300 font-bold leading-relaxed">
          {t?.maintenanceDesc || 'The system is currently undergoing maintenance. Please wait a moment.'}
        </p>

        <div className="mt-12 flex justify-center gap-4">
          <div className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
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
