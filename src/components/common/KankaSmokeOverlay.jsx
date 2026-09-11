import React, { useEffect, useRef } from 'react';

/**
 * تأثير دخان الشيشة الساحر والأنيق (Kanka Luxury Smoke Effect)
 * مصمم خصيصاً لشاشات كافتيريا كانكا أورينت ديلوكس
 * يتميز بكونه:
 * 1. فائق النعومة والخفة (مبني بـ Offscreen Pre-rendered Sprites لتوفير 99% من جهد المعالجة).
 * 2. تأثير خفيف وجمالي (لا يحجب أسماء المعسل، القوائم، أو الأسعار، بل يضفي أجواء الشيشة الفاخرة).
 * 3. يدعم التكبير والتصغير التلقائي ويتوقف عند سكون التبويب لتوفير الطاقة.
 */
export const KankaSmokeOverlay = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // تجهيز صور الدخان المسبقة (Offscreen Sprite Stamping) لأعلى أداء بدون بطء على التلفزيون
    const spriteSize = 256;
    const offscreen = document.createElement('canvas');
    offscreen.width = spriteSize;
    offscreen.height = spriteSize;
    const offCtx = offscreen.getContext('2d');

    if (offCtx) {
      const rad = spriteSize / 2;
      const grad = offCtx.createRadialGradient(rad, rad, 0, rad, rad, rad);
      // تدرج دخاني ناعم مائل للدفء الذهبي الفاخر ليتناغم مع هوية كانكا
      grad.addColorStop(0, 'rgba(255, 250, 240, 0.40)');
      grad.addColorStop(0.25, 'rgba(250, 242, 230, 0.25)');
      grad.addColorStop(0.55, 'rgba(235, 220, 205, 0.12)');
      grad.addColorStop(0.85, 'rgba(220, 205, 190, 0.03)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      offCtx.fillStyle = grad;
      offCtx.beginPath();
      offCtx.arc(rad, rad, rad, 0, Math.PI * 2);
      offCtx.fill();
    }

    // عدد جسيمات الدخان (خفيف جداً ومتزن: 20 سحابة دخان فقط لتظل القائمة واضحة تماماً)
    const PARTICLE_COUNT = 20;
    const particles = [];

    const createParticle = (initialRandomY = false) => {
      // تنطلق السحب من الجزء السفلي، مع انتشار انسيابي ناعم
      const spawnX = width * 0.05 + Math.random() * (width * 0.9);
      const spawnY = initialRandomY ? Math.random() * height : height + Math.random() * 80;

      return {
        x: spawnX,
        y: spawnY,
        baseX: spawnX,
        size: 130 + Math.random() * 150,
        targetSize: 300 + Math.random() * 220, // تتمدد سحابة الدخان تدريجياً أثناء صعودها
        speedY: 0.3 + Math.random() * 0.4, // حركة بطيئة وناعمة تشبه حركة الدخان الحقيقي
        swirlAngle: Math.random() * Math.PI * 2,
        swirlSpeed: 0.006 + Math.random() * 0.01,
        swirlRadius: 25 + Math.random() * 45,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        alpha: 0,
        maxAlpha: 0.10 + Math.random() * 0.14, // شفافية ناعمة جداً للحفاظ على وضوح الصورة 100%
        life: 0,
        maxLife: 550 + Math.random() * 400
      };
    };

    // تهيئة الجسيمات موزعة على الشاشة أول مرة
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true));
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // حلقة الرسم الحركي المستمرة (Game Loop at 60fps)
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // رسم وتحريك كل سحابة دخان
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // حركة الصعود العمودية البطيئة
        p.y -= p.speedY;

        // تموج جانبي ناعم (Swirl) يشبه حركة هواء الشيشة المنثور
        p.swirlAngle += p.swirlSpeed;
        p.x = p.baseX + Math.sin(p.swirlAngle) * p.swirlRadius;

        // دوران السحابة ببطء
        p.rotation += p.rotSpeed;

        // تمدد السحابة مع الصعود
        const lifeRatio = p.life / p.maxLife;
        const currentSize = p.size + (p.targetSize - p.size) * lifeRatio;

        // ظهور تدريجي في البداية، ثم ثبات ناعم، ثم تلاشي تام قبل القمة
        if (lifeRatio < 0.2) {
          p.alpha = (lifeRatio / 0.2) * p.maxAlpha;
        } else if (lifeRatio > 0.7) {
          p.alpha = ((1 - lifeRatio) / 0.3) * p.maxAlpha;
        } else {
          p.alpha = p.maxAlpha;
        }

        // رسم السحابة الشفافة باستخدام الـ Sprite المجهز مسبقاً
        if (p.alpha > 0.005) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.drawImage(offscreen, -currentSize / 2, -currentSize / 2, currentSize, currentSize);
          ctx.restore();
        }

        // إعادة تدوير السحابة عندما تنتهي دورة حياتها أو تتجاوز أعلى الشاشة
        if (p.life >= p.maxLife || p.y < -currentSize) {
          particles[i] = createParticle(false);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {/* طبقة كانفاس دخان الشيشة الواقعي الخفيف والمتحرك بنعومة */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-90"
      />

      {/* لمسة ضبابية ساحرة ودافئة أسفل الشاشة توحي بجلسة الشيشة الشرقية الهادئة */}
      <div 
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none opacity-30 bg-gradient-to-t from-amber-500/10 via-white/5 to-transparent"
        style={{ filter: 'blur(25px)' }}
      />
    </div>
  );
};
