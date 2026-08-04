import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export const PinProtectionModal = ({ onVerify, onClose, t, lang }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onVerify(pinInput);
    if (!success) {
      setErrorMsg(true);
      setPinInput('');
    }
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6" dir={dir}>
      <div className="max-w-md w-full bg-gray-900 border-2 border-yellow-500/50 rounded-3xl p-8 shadow-2xl text-white text-center relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white p-2 rounded-full cursor-pointer">
          ✕
        </button>
        
        <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/30 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Lock className="w-10 h-10 text-yellow-400 animate-pulse" />
        </div>

        <h3 className="text-3xl font-black mb-2 text-yellow-400">{t.pinProtectionTitle}</h3>
        <p className="text-gray-300 text-sm mb-6">{t.enterPinPrompt}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="password" 
            maxLength={6}
            value={pinInput}
            onChange={(e) => { setPinInput(e.target.value); setErrorMsg(false); }}
            placeholder="••••"
            autoFocus
            className="w-full text-center text-4xl font-mono font-black tracking-widest py-4 bg-black border-2 border-yellow-500/60 rounded-2xl text-yellow-400 focus:outline-none focus:border-yellow-400 shadow-inner"
          />

          {errorMsg && (
            <p className="text-red-500 font-bold text-sm bg-red-500/10 py-2 rounded-xl border border-red-500/30">{t.wrongPin}</p>
          )}

          <button type="submit" className="w-full py-4 rounded-2xl text-2xl font-black bg-yellow-500 hover:bg-yellow-400 text-black shadow-xl transition active:scale-95 cursor-pointer">
            {t.adminBtnTitle}
          </button>
        </form>
      </div>
    </div>
  );
};
