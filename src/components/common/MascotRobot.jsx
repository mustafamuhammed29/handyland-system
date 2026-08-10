import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Heart, X, MessageSquare } from 'lucide-react';

/**
 * مكون الروبوت التفاعلي الممتع (Mascot Robot)
 * يتجول بمرونة في الشاشة ويلوح للجمهور ويظهر عبارات ترحيبية باللغات الثلاث
 */
export const MascotRobot = ({ lang = 'de', customGreeting = null, isVisible = true, onToggleVisibility }) => {
  const [positionIndex, setPositionIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [hearts, setHearts] = useState([]);
  const [isWavingFast, setIsWavingFast] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // قوائم العبارات الترحيبية للروبوت
  const greetings = {
    ar: [
      "مرحباً بكم في Handyland! 🤖👋",
      "أهلاً وسهلاً بجميع زوارنا الكرام! ✨",
      "نقدم لكم أفضل العروض وأحدث الهواتف 📱",
      "مركز الصيانة السريعة في خدمتكم دائماً 🛠️",
      "أسعد الله جميع أوقاتكم! 🚀",
    ],
    de: [
      "Willkommen bei Handyland! 🤖👋",
      "Beste Angebote & schnelle Reparatur! 📱✨",
      "Wir freuen uns sehr auf Ihren Besuch! 🚀",
      "Top-Qualität & bester Service für Sie! 🛠️",
      "Einen wunderschönen Tag wünscht Handyland! 🌟",
    ],
    en: [
      "Welcome to Handyland! 🤖👋",
      "Best smartphone deals & repair center! 📱✨",
      "We are delighted to have you here! 🚀",
      "Fast & reliable service for your devices! 🛠️",
      "Have a wonderful day! 🌟",
    ],
  };

  const activeList = greetings[lang] || greetings.de;
  const currentMessage = customGreeting || activeList[messageIndex % activeList.length];

  // التبديل الدوري للمواقع الـ 3 على الشاشة كل 15 ثانية
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const moveTimer = setInterval(() => {
      setPositionIndex((prev) => (prev + 1) % 3);
    }, 15000);

    return () => clearInterval(moveTimer);
  }, [isVisible, isMinimized]);

  // التبديل الدوري للرسائل الترحيبية كل 6 ثوانٍ
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const msgTimer = setInterval(() => {
      setShowBubble(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % activeList.length);
        setShowBubble(true);
      }, 400);
    }, 7000);

    return () => clearInterval(msgTimer);
  }, [isVisible, isMinimized, activeList.length]);

  // تفاعل عند نقر الروبوت
  const handleRobotClick = () => {
    setIsWavingFast(true);
    setTimeout(() => setIsWavingFast(false), 2000);

    // إضافة تأثير قلوب ونجوم متطايرة
    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 60 - 30,
      size: Math.random() * 16 + 14,
    }));
    setHearts((prev) => [...prev, ...newHearts]);

    // مسح القلوب بعد انتهاء الأنيميشن
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.find((nh) => nh.id === h.id)));
    }, 1500);

    // تغيير الرسالة والانتقال للموقع التالي فوراً
    setMessageIndex((prev) => (prev + 1) % activeList.length);
  };

  if (!isVisible) return null;

  // مواضع الروبوت عبر الشاشة
  const positions = [
    "bottom-6 right-6 lg:bottom-10 lg:right-10", // Position 0: أسفل اليمين
    "bottom-6 left-6 lg:bottom-10 lg:left-10",   // Position 1: أسفل اليسار
    "top-24 right-6 lg:top-28 lg:right-12",       // Position 2: أعلى اليمين
  ];

  return (
    <div
      className={`fixed z-[999990] transition-all duration-1000 ease-in-out select-none flex flex-col items-center ${
        positions[positionIndex]
      }`}
    >
      {/* تأثير الجسيمات والقلوب المتطايرة عند اللمس */}
      <div className="relative w-0 h-0">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="absolute animate-ping text-yellow-400 pointer-events-none"
            style={{
              left: `${h.left}px`,
              bottom: '40px',
              fontSize: `${h.size}px`,
              animationDuration: '1.2s',
            }}
          >
            <Heart className="fill-yellow-400 text-yellow-500 drop-shadow-[0_0_8px_#facc15]" />
          </div>
        ))}
      </div>

      {/* زر تصغير / إغلاق صغير */}
      <div className="flex gap-1 mb-1 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="bg-black/80 hover:bg-yellow-500 hover:text-black text-gray-300 p-1 rounded-full text-xs transition border border-yellow-500/30"
          title={isMinimized ? "تكبير الروبوت" : "تصغير الروبوت"}
        >
          {isMinimized ? <Bot className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isMinimized ? (
        <div className="flex flex-col items-center cursor-pointer group" onClick={handleRobotClick}>
          {/* فقاعة الحديث (Speech Bubble) */}
          <div
            className={`transition-all duration-500 transform ${
              showBubble ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2'
            } mb-2 max-w-xs lg:max-w-md bg-gradient-to-r from-gray-950/90 via-black/95 to-gray-950/90 border-2 border-yellow-400/80 text-white px-4 py-2.5 rounded-2xl shadow-[0_0_35px_rgba(234,179,8,0.4)] backdrop-blur-xl flex items-center gap-2.5 relative`}
          >
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse shrink-0" />
            <span className="text-sm lg:text-base font-bold tracking-wide text-yellow-100 leading-snug">
              {currentMessage}
            </span>

            {/* سهم الفقاعة أسفل */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-yellow-400/90" />
          </div>

          {/* جسم الروبوت ثلاثي الأبعاد SVG Mascot */}
          <div className="relative group-hover:scale-110 transition-transform duration-300 animate-bounce" style={{ animationDuration: '3s' }}>
            {/* وهج الخلفية للروبوت */}
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />

            <svg
              width="85"
              height="95"
              viewBox="0 0 100 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]"
            >
              {/* الهوائي Antenna */}
              <line x1="50" y1="18" x2="50" y2="8" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="6" r="5" fill="#ef4444" className="animate-ping" style={{ animationDuration: '1.5s' }} />
              <circle cx="50" cy="6" r="4" fill="#facc15" />

              {/* الرأس Head */}
              <rect x="22" y="18" width="56" height="38" rx="14" fill="url(#headGradient)" stroke="#facc15" strokeWidth="3" />
              
              {/* الشاشة / الوجه Face Screen */}
              <rect x="28" y="24" width="44" height="26" rx="8" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />

              {/* العيون Glowing Eyes */}
              <circle cx="40" cy="37" r="5.5" fill="#38bdf8" className="animate-pulse" />
              <circle cx="40" cy="37" r="2" fill="#ffffff" />
              <circle cx="60" cy="37" r="5.5" fill="#38bdf8" className="animate-pulse" />
              <circle cx="60" cy="37" r="2" fill="#ffffff" />

              {/* الفم المبتسم Smiling Mouth */}
              <path d="M43 44 Q50 48 57 44" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* الجسم Body */}
              <rect x="26" y="58" width="48" height="42" rx="12" fill="url(#bodyGradient)" stroke="#facc15" strokeWidth="3" />

              {/* شارة الصدر Chest Badge (Handyland H) */}
              <rect x="40" y="66" width="20" height="18" rx="5" fill="#18181b" stroke="#eab308" strokeWidth="1.5" />
              <path d="M45 71 V79 M55 71 V79 M45 75 H55" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />

              {/* اليد اليسرى Left Arm (الثابتة) */}
              <rect x="12" y="62" width="10" height="24" rx="5" fill="#3f3f46" stroke="#facc15" strokeWidth="2" />

              {/* اليد اليمنى الملوحة Right Arm (Waving) */}
              <g
                style={{
                  transformOrigin: '78px 64px',
                  animation: isWavingFast ? 'waveFast 0.3s infinite ease-in-out alternate' : 'waveSlow 1.5s infinite ease-in-out alternate',
                }}
              >
                <rect x="78" y="62" width="10" height="24" rx="5" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
                {/* كف اليد Hand */}
                <circle cx="83" cy="88" r="5" fill="#facc15" />
              </g>

              {/* القدمين Legs */}
              <rect x="34" y="98" width="10" height="10" rx="3" fill="#27272a" stroke="#facc15" strokeWidth="1.5" />
              <rect x="56" y="98" width="10" height="10" rx="3" fill="#27272a" stroke="#facc15" strokeWidth="1.5" />

              {/* التدرجات اللونية Gradients */}
              <defs>
                <linearGradient id="headGradient" x1="22" y1="18" x2="78" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#18181b" />
                  <stop offset="1" stopColor="#27272a" />
                </linearGradient>
                <linearGradient id="bodyGradient" x1="26" y1="58" x2="74" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#27272a" />
                  <stop offset="1" stopColor="#09090b" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      ) : (
        /* زر الروبوت المصغّر */
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-black p-3 rounded-full shadow-[0_0_20px_#facc15] animate-bounce flex items-center gap-1 border-2 border-white cursor-pointer"
          title="إظهار الروبوت التفاعلي"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* أنيميشن التلويح بأسلوب CSS Keyframes */}
      <style>{`
        @keyframes waveSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-45deg); }
        }
        @keyframes waveFast {
          0% { transform: rotate(10deg); }
          100% { transform: rotate(-65deg); }
        }
      `}</style>
    </div>
  );
};
