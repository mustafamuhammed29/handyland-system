import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';

/**
 * مكون التحكم بالتكبير لجميع شاشات التلفزيون الذكية (Smart TV, Android TV, Tizen, WebOS, Chrome, Edge)
 * يضمن التكبير 100% مع الدعم التلقائي في حال عدم دعم المتصفح لخاصية Native Fullscreen.
 */
export const TVScreenControls = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSimulatedFullscreen, setIsSimulatedFullscreen] = useState(false);
  const btnRef = useRef(null);

  // دالة تكبير وتوسيع الشاشة الشاملة لكافة المتصفحات والتلفزيونات الذكية
  const triggerFullscreen = useCallback(() => {
    const doc = document;
    const docEl = document.documentElement;

    // 1. محاولة استخدام Native Fullscreen API بالبوادئ المختلفة
    const requestNativeFS = 
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.msRequestFullscreen;

    if (requestNativeFS && !doc.fullscreenElement && !doc.webkitFullscreenElement) {
      try {
        const promise = requestNativeFS.call(docEl);
        if (promise && promise.then) {
          promise.then(() => {
            setIsFullscreen(true);
            setIsSimulatedFullscreen(false);
          }).catch((err) => {
            console.warn('Native Fullscreen denied, activating Simulated Viewport Fullscreen:', err);
            activateSimulatedFullscreen();
          });
        } else {
          setIsFullscreen(true);
        }
      } catch (e) {
        activateSimulatedFullscreen();
      }
    } else {
      activateSimulatedFullscreen();
    }
  }, []);

  // دالة التكبير الاصطناعي (Simulated Viewport Fullscreen) لشاشات Smart TV التي ترفض API التكبير
  const activateSimulatedFullscreen = () => {
    try {
      window.scrollTo(0, 1);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.classList.add('tv-full-viewport');
      setIsSimulatedFullscreen(true);
      setIsFullscreen(true);
    } catch (e) {
      console.warn('Simulated Fullscreen notice:', e);
    }
  };

  const deactivateFullscreen = () => {
    const doc = document;
    const exitFS = 
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    if (exitFS && (doc.fullscreenElement || doc.webkitFullscreenElement)) {
      try {
        exitFS.call(doc).catch(() => {});
      } catch (e) {}
    }

    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.documentElement.classList.remove('tv-full-viewport');
    setIsFullscreen(false);
    setIsSimulatedFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && !isSimulatedFullscreen && !document.fullscreenElement) {
      triggerFullscreen();
    } else {
      deactivateFullscreen();
    }
  };

  // متابعة تغير حالة الشاشة في المتصفح
  useEffect(() => {
    const handleFSChange = () => {
      const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFS);
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
    };
  }, []);

  // الاستماع لحدث التكبير عن بُعد أو الضغط بالريموت
  useEffect(() => {
    const handleRemoteFullscreen = () => {
      triggerFullscreen();
    };

    window.addEventListener('tv_remote_fullscreen_requested', handleRemoteFullscreen);
    return () => window.removeEventListener('tv_remote_fullscreen_requested', handleRemoteFullscreen);
  }, [triggerFullscreen]);

  return (
    <>
      <button 
        ref={btnRef}
        onClick={toggleFullscreen}
        title="Vollbild / Fullscreen"
        className="fixed top-3 right-3 z-[999999] bg-yellow-500 hover:bg-yellow-400 text-black font-black px-4 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(234,179,8,0.7)] border-2 border-white flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          right: '12px',
          opacity: 0.95,
        }}
      >
        {isFullscreen || isSimulatedFullscreen ? (
          <>
            <Minimize className="w-5 h-5 text-black" />
            <span className="text-xs font-black hidden sm:inline">إلغاء التكبير</span>
          </>
        ) : (
          <>
            <Maximize className="w-5 h-5 text-black animate-pulse" />
            <span className="text-xs font-black">📺 ملء الشاشة</span>
          </>
        )}
      </button>

      {/* أنيميشن وأنماط التكبير الشامل */}
      <style>{`
        .tv-full-viewport {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 999999 !important;
          background: #000000 !important;
        }
      `}</style>
    </>
  );
};
