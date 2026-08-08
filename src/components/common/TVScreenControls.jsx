import React, { useState, useEffect, useCallback } from 'react';
import { Maximize, Minimize, Expand } from 'lucide-react';

export const TVScreenControls = ({ lang = 'de' }) => {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // تحديث حالة وضع ملء الشاشة فورياً
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // دعم اختصار لوحة المفاتيح والريموت كونترول (F أو F11)
    const handleKeyDown = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
          toggleFullscreen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen().catch(() => {});
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen().catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen().catch(() => {});
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Fullscreen notice:', e);
    }
  }, []);

  const isAr = lang === 'ar';

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        right: '16px',
        zIndex: 999999,
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? (isAr ? 'تصغير الشاشة' : 'Vollbild beenden') : (isAr ? 'تكبير وملء الشاشة' : 'Vollbildmodus aktivieren')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: isFullscreen 
            ? (isHovered ? '#1f2937' : 'rgba(17, 24, 39, 0.4)') 
            : '#eab308',
          color: isFullscreen ? '#facc15' : '#000000',
          padding: isFullscreen ? '10px 14px' : '12px 18px',
          borderRadius: '16px',
          border: isFullscreen ? '1.5px solid rgba(234, 179, 8, 0.4)' : '2.5px solid #facc15',
          boxShadow: isFullscreen 
            ? '0 4px 15px rgba(0,0,0,0.5)' 
            : '0 0 25px rgba(234, 179, 8, 0.6), 0 4px 15px rgba(0,0,0,0.8)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 900,
          fontSize: '14px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isFullscreen ? (isHovered ? 1 : 0.25) : 0.95,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          backdropFilter: 'blur(10px)',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
        }}
      >
        {isFullscreen ? (
          <>
            <Minimize style={{ width: 20, height: 20, strokeWidth: 2.5 }} />
            {isHovered && <span>{isAr ? 'تصغير' : 'Beenden'}</span>}
          </>
        ) : (
          <>
            <Maximize style={{ width: 22, height: 22, strokeWidth: 2.5, animation: 'pulse 2s infinite' }} />
            <span>{isAr ? 'تكبير الشاشة' : 'Vollbild'}</span>
          </>
        )}
      </button>
    </div>
  );
};
