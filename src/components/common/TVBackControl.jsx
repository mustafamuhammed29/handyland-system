import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export const TVBackControl = ({ onBack, t }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'GoBack') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <button 
      onClick={onBack}
      className="fixed top-4 left-4 z-50 bg-black/40 hover:bg-yellow-500 hover:text-black text-yellow-400/90 hover:text-black p-2.5 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/60 backdrop-blur-md transition-all shadow-lg opacity-40 hover:opacity-100 group cursor-pointer"
      title={t.returnToMenuBtn}
    >
      <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
    </button>
  );
};
