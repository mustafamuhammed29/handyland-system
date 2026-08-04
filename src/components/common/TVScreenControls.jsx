import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export const TVScreenControls = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock Error:', err);
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <button 
      onClick={toggleFullscreen}
      title="Vollbild / Fullscreen"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        right: '14px',
        zIndex: 99999,
        backgroundColor: isFullscreen ? '#111827' : '#eab308',
        color: isFullscreen ? '#facc15' : '#000000',
        padding: '13px',
        borderRadius: '14px',
        border: '2px solid #eab308',
        boxShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 20px rgba(234,179,8,0.5)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        WebkitAppearance: 'none',
        outline: 'none',
        minWidth: '50px',
        minHeight: '50px',
        visibility: 'visible',
        opacity: 1,
      }}
    >
      {isFullscreen 
        ? <Minimize style={{ width: 28, height: 28, color: '#facc15', display: 'block' }} /> 
        : <Maximize style={{ width: 28, height: 28, color: '#000000', display: 'block' }} />}
    </button>
  );
};
