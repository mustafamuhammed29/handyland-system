import React, { useEffect, useRef } from 'react';

/**
 * تأثير دخان الشيشة الساحر والواضح (Kanka Luxury Hookah Smoke)
 * مصمم خصيصاً لشاشات كافتيريا كانكا أورينت ديلوكس:
 * - وضوح بصري جميل وملحوظ (واضح للعين كأنه شخص يدخن وينثر سحب الدخان برقة).
 * - لا يحجب نصوص القائمة أو المنتجات نهائياً بفضل الشفافية المتدرجة ونمط الدمج الذكي (screen/lighten).
 * - أداء فائق 60fps عبر Offscreen Canvas Sprites بدون أي ثقل على التلفزيون.
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

    // تجهيز سحابتين مختلفتين من الدخان المسبق (Offscreen Sprites) لتنوع بصري وأداء فائق
    const spriteSize = 320;
    
    // سحابة 1: دخان أبيض كثيف وناعم في المركز
    const sprite1 = document.createElement('canvas');
    sprite1.width = spriteSize;
    sprite1.height = spriteSize;
    const s1Ctx = sprite1.getContext('2d');
    if (s1Ctx) {
      const rad = spriteSize / 2;
      const grad = s1Ctx.createRadialGradient(rad, rad, 0, rad, rad, rad);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.2, 'rgba(250, 245, 235, 0.65)');
      grad.addColorStop(0.45, 'rgba(240, 230, 215, 0.35)');
      grad.addColorStop(0.75, 'rgba(225, 215, 200, 0.10)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      s1Ctx.fillStyle = grad;
      s1Ctx.beginPath();
      s1Ctx.arc(rad, rad, rad, 0, Math.PI * 2);
      s1Ctx.fill();
    }

    // سحابة 2: دخان منثور أكثر نعومة وتموجاً
    const sprite2 = document.createElement('canvas');
    sprite2.width = spriteSize;
    sprite2.height = spriteSize;
    const s2Ctx = sprite2.getContext('2d');
    if (s2Ctx) {
      const rad = spriteSize / 2;
      const grad = s2Ctx.createRadialGradient(rad * 0.85, rad * 0.85, 0, rad, rad, rad);
      grad.addColorStop(0, 'rgba(255, 250, 240, 0.75)');
      grad.addColorStop(0.3, 'rgba(245, 238, 225, 0.50)');
      grad.addColorStop(0.6, 'rgba(230, 220, 205, 0.20)');
      grad.addColorStop(0.85, 'rgba(215, 205, 190, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      s2Ctx.fillStyle = grad;
      s2Ctx.beginPath();
      s2Ctx.arc(rad, rad, rad, 0, Math.PI * 2);
      s2Ctx.fill();
    }

    const sprites = [sprite1, sprite2];

    // عدد الجسيمات للحصول على مظهر غني وواضح بدون حجب المحتوى
    const PARTICLE_COUNT = 32;
    const particles = [];

    const createParticle = (initialRandomY = false) => {
      // تتولد سحب الدخان أساساً من الثلثين السفليين (كأنها صاعدة من طاولة الشيشة)
      const spawnX = width * 0.05 + Math.random() * (width * 0.9);
      const spawnY = initialRandomY 
        ? height * 0.2 + Math.random() * (height * 0.8) 
        : height + 20 + Math.random() * 80;

      return {
        x: spawnX,
        y: spawnY,
        baseX: spawnX,
        sprite: sprites[Math.floor(Math.random() * sprites.length)],
        size: 160 + Math.random() * 180,
        targetSize: 420 + Math.random() * 320, // تتمدد سحابة الدخان بشكل كبير كلما ارتفعت
        speedY: 0.45 + Math.random() * 0.65, // سرعة الصعود الانسيابي
        swirlAngle: Math.random() * Math.PI * 2,
        swirlSpeed: 0.008 + Math.random() * 0.015,
        swirlRadius: 35 + Math.random() * 65, // تموج جانبي يماثل نثر الهواء
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.005,
        alpha: 0,
        maxAlpha: 0.28 + Math.random() * 0.22, // شفافية ملحوظة وواضحة جداً (28% - 50%)
        life: 0,
        maxLife: 420 + Math.random() * 300
      };
    };

    // تعبئة الشاشة تدريجياً في البداية
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true));
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // حركة الصعود
        p.y -= p.speedY;

        // التموج والانعطاف الجانبي الواقعي
        p.swirlAngle += p.swirlSpeed;
        p.x = p.baseX + Math.sin(p.swirlAngle) * p.swirlRadius;

        // دوران السحابة البطيء
        p.rotation += p.rotSpeed;

        // تمدد السحابة مع الصعود
        const progress = p.life / p.maxLife;
        const currentSize = p.size + (p.targetSize - p.size) * progress;

        // منحنى الشفافية: تصاعد ناعم ثم ظهور كامل ثم تلاشٍ سلس في الأعلى
        if (progress < 0.2) {
          p.alpha = (progress / 0.2) * p.maxAlpha;
        } else if (progress > 0.65) {
          p.alpha = ((1 - progress) / 0.35) * p.maxAlpha;
        } else {
          p.alpha = p.maxAlpha;
        }

        if (p.alpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.drawImage(p.sprite, -currentSize / 2, -currentSize / 2, currentSize, currentSize);
          ctx.restore();
        }

        // إعادة تدوير السحابة عندما تنتهي أو تتجاوز الشاشة
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
      {/* طبقة كانفاس دخان الشيشة الواقعي الصاعد والمتحرك */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen', opacity: 0.95 }}
      />

      {/* لمسة سحابية هادئة عند أسفل الشاشة توحي باستقرار الدخان على الطاولة */}
      <div 
        className="absolute inset-x-0 bottom-0 h-48 pointer-events-none opacity-50 bg-gradient-to-t from-white/15 via-white/5 to-transparent"
        style={{ filter: 'blur(35px)' }}
      />
    </div>
  );
};
