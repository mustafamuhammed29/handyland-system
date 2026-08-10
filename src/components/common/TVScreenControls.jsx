import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';

/**
 * مكون زر التحكم بالتكبير لجميع واجهات التلفزيون والأجهزة الذكية
 */
export const TVScreenControls = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const btnRef = useRef(null);

  // متابعة حالة التكبير بدقة لجميع المتصفحات
  useEffect(() => {
    const updateFSState = () => {
      const isFS = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFS);
    };

    updateFSState();

    document.addEventListener('fullscreenchange', updateFSState);
    document.addEventListener('webkitfullscreenchange', updateFSState);
    document.addEventListener('mozfullscreenchange', updateFSState);
    document.addEventListener('MSFullscreenChange', updateFSState);

    return () => {
      document.removeEventListener('fullscreenchange', updateFSState);
      document.removeEventListener('webkitfullscreenchange', updateFSState);
      document.removeEventListener('mozfullscreenchange', updateFSState);
      document.removeEventListener('MSFullscreenChange', updateFSState);
    };
  }, []);

  // الاستماع لحدث التكبير عن بُعد من لوحة الأدمن
  useEffect(() => {
    const handleRemoteFullscreen = () => {
      if (btnRef.current) {
        btnRef.current.click();
      }
    };
    window.addEventListener('tv_remote_fullscreen_requested', handleRemoteFullscreen);
    return () => window.removeEventListener('tv_remote_fullscreen_requested', handleRemoteFullscreen);
  }, []);

  const toggleFullscreen = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const doc = document;
    const docEl = document.documentElement;

    const activeFS = 
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    if (!activeFS) {
      const requestFS = 
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;

      if (requestFS) {
        try {
          const promise = requestFS.call(docEl);
          if (promise && promise.then) {
            promise.then(() => setIsFullscreen(true)).catch(() => {});
          } else {
            setIsFullscreen(true);
          }
        } catch (err) {}
      }
    } else {
      const exitFS = 
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen;

      if (exitFS) {
        try {
          const promise = exitFS.call(doc);
          if (promise && promise.then) {
            promise.then(() => setIsFullscreen(false)).catch(() => {});
          } else {
            setIsFullscreen(false);
          }
        } catch (err) {}
      }
    }
  };

  return (
    <button 
      ref={btnRef}
      onClick={toggleFullscreen}
      title="Vollbild / Fullscreen"
      className="fixed top-3 right-3 z-[999999] bg-yellow-500 hover:bg-yellow-400 text-black font-black p-3.5 rounded-2xl shadow-[0_0_25px_rgba(234,179,8,0.8)] border-2 border-white flex items-center justify-center cursor-pointer transition-transform active:scale-90"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        right: '14px',
        opacity: 0.95,
        minWidth: '52px',
        minHeight: '52px',
      }}
    >
      {isFullscreen ? (
        <Minimize className="w-7 h-7 text-black stroke-[2.5]" />
      ) : (
        <Maximize className="w-7 h-7 text-black stroke-[2.5]" />
      )}
    </button>
  );
};
