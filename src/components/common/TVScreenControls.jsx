import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, Tv } from 'lucide-react';
import { requestUniversalFullscreen, exitUniversalFullscreen } from '../../utils/fullscreenHelpers';

export const TVScreenControls = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPromptBadge, setShowPromptBadge] = useState(false);

  // متابعة حالة التكبير عبر الأحداث الرسمية للمتصفحات
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(active);
      if (active) {
        setShowPromptBadge(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // الاستماع لحدث التكبير عن بُعد القادم من الأدمن
  useEffect(() => {
    const handleRemoteFullscreen = () => {
      const success = requestUniversalFullscreen();
      if (!success || !document.fullscreenElement) {
        setShowPromptBadge(true);
        setTimeout(() => setShowPromptBadge(false), 15000);
      }
    };

    window.addEventListener('tv_remote_fullscreen_requested', handleRemoteFullscreen);
    return () => window.removeEventListener('tv_remote_fullscreen_requested', handleRemoteFullscreen);
  }, []);

  // تفعيل التكبير التلقائي عند أول لمس أو كبسة ريموت (فقط في شاشات العروض وليس في لوحة الإدارة)
  useEffect(() => {
    const currentHash = (window.location.hash || '').replace('#', '').toLowerCase();
    const isAdminView = currentHash.startsWith('admin') || currentHash === 'menu' || currentHash === '';

    // إذا كنا في لوحة الإدارة أو القائمة الرئيسية، لا نربط التكبير التلقائي عند أي لمسة
    if (isAdminView) return;

    const handleFirstUserInteraction = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        requestUniversalFullscreen();
      }
    };

    window.addEventListener('pointerdown', handleFirstUserInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      requestUniversalFullscreen();
    } else {
      exitUniversalFullscreen();
    }
  };

  return (
    <>
      {/* شارة تذكير تفاعلية أفقية تظهر عند استلام أمر تكبير عن بعد */}
      {showPromptBadge && !isFullscreen && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[999999] animate-bounce">
          <button
            onClick={toggleFullscreen}
            className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-black font-black px-6 py-3.5 rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.9)] text-base lg:text-lg border-2 border-white flex items-center gap-3 cursor-pointer"
          >
            <Tv className="w-6 h-6 animate-pulse" />
            <span>انقر هنا أو اضغط OK بالريموت لتثبيت ملء الشاشة الكامل</span>
          </button>
        </div>
      )}

      {/* زر التكبير الثابت في زاوية الشاشة العلوي */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "تصغير الشاشة" : "تكبير الشاشة ملء الشاشة (Vollbild)"}
        className={`fixed top-4 right-4 z-[99999] p-3 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-xl ${
          isFullscreen
            ? 'bg-gray-950/40 hover:bg-gray-900 border-gray-700/50 text-gray-400 hover:text-white opacity-40 hover:opacity-100'
            : 'bg-yellow-500 text-black border-white shadow-[0_0_25px_rgba(250,204,21,0.8)] opacity-95 hover:scale-110 animate-pulse'
        }`}
      >
        {isFullscreen ? (
          <Minimize className="w-6 h-6" />
        ) : (
          <div className="flex items-center gap-2">
            <Maximize className="w-6 h-6" />
            <span className="text-xs font-black hidden md:inline">Vollbild</span>
          </div>
        )}
      </button>
    </>
  );
};
