import React, { useEffect, useRef } from 'react';

/**
 * تأثير دخان الشيشة السينمائي الفاخر لشاشات التلفزيون (Kanka TV Cinema Hookah Smoke)
 * مصمم ومُعاير خصيصاً ليظهر بوضوح فائق وملموس على شاشات التلفزيون الكبيرة (Smart TVs):
 * - حل مشكلة شاشات التلفزيون: الاستغناء التام عن CSS mix-blend-mode المعطوب في متصفحات التلفزيونات،
 *   والاعتماد على رسم الكانفاس الحقيقي (Direct Alpha Compositing) ليظهر الدخان بوضوح وجلاء فائقين.
 * - حجم جسيمات سينمائي كبير (TV-Scale Plumes) يُرى بوضوح على بُعد 3 إلى 5 أمتار من الشاشة.
 * - سحب دخان ثلاثية الأبعاد ذات كثافة ملموسة وتباين ممتاز فوق الصور والفيديوهات الفاتحة والداكنة.
 * - استجابة فورية 100% لمستوى التباين والكثافة المحدد في لوحة التحكم (0% - 100%).
 * - أداء فائق وسلس 60fps خفيف تماماً على معالجات التلفزيونات الذكية.
 */
export const KankaSmokeOverlay = ({ intensity = 50 }) => {
  const canvasRef = useRef(null);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = Math.max(0, Math.min(100, Number(intensity) ?? 50));
  }, [intensity]);

  const numericIntensity = Math.max(0, Math.min(100, Number(intensity) ?? 50));
  if (numericIntensity <= 0) {
    return null;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId = null;
    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.clientWidth || window.innerWidth : window.innerWidth);
    let height = (canvas.height = parent ? parent.clientHeight || window.innerHeight : window.innerHeight);

    // تجهيز سحابات دخان مسبقة عالية الجودة (Offscreen Sprites) بحجم مناسب للتلفزيونات (480px)
    const spriteSize = 480;

    // سحابة 1: سحابة شيشة بيضاء ممتلئة وواضحة جداً (Dense Shisha Plume)
    const sprite1 = document.createElement('canvas');
    sprite1.width = spriteSize;
    sprite1.height = spriteSize;
    const s1Ctx = sprite1.getContext('2d');
    if (s1Ctx) {
      const rad = spriteSize / 2;
      const grad = s1Ctx.createRadialGradient(rad, rad, 0, rad, rad, rad);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      grad.addColorStop(0.18, 'rgba(252, 250, 245, 0.90)');
      grad.addColorStop(0.40, 'rgba(245, 240, 235, 0.72)');
      grad.addColorStop(0.65, 'rgba(235, 228, 220, 0.40)');
      grad.addColorStop(0.85, 'rgba(220, 215, 205, 0.15)');
      grad.addColorStop(1, 'rgba(200, 200, 200, 0)');
      s1Ctx.fillStyle = grad;
      s1Ctx.beginPath();
      s1Ctx.arc(rad, rad, rad, 0, Math.PI * 2);
      s1Ctx.fill();
    }

    // سحابة 2: سحابة متموجة بمركز غير متماثل لمحاكاة حركة الهواء الواقعية (Turbulent Swirl)
    const sprite2 = document.createElement('canvas');
    sprite2.width = spriteSize;
    sprite2.height = spriteSize;
    const s2Ctx = sprite2.getContext('2d');
    if (s2Ctx) {
      const rad = spriteSize / 2;
      const grad = s2Ctx.createRadialGradient(rad * 0.75, rad * 0.8, 0, rad, rad, rad);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.25, 'rgba(250, 245, 240, 0.82)');
      grad.addColorStop(0.52, 'rgba(240, 235, 228, 0.52)');
      grad.addColorStop(0.78, 'rgba(225, 220, 210, 0.22)');
      grad.addColorStop(1, 'rgba(200, 200, 200, 0)');
      s2Ctx.fillStyle = grad;
      s2Ctx.beginPath();
      s2Ctx.arc(rad, rad, rad, 0, Math.PI * 2);
      s2Ctx.fill();
    }

    // سحابة 3: غيمة دائرية لولبية ناعمة توفر خلفية ضبابية غنية
    const sprite3 = document.createElement('canvas');
    sprite3.width = spriteSize;
    sprite3.height = spriteSize;
    const s3Ctx = sprite3.getContext('2d');
    if (s3Ctx) {
      const rad = spriteSize / 2;
      const grad = s3Ctx.createRadialGradient(rad * 1.1, rad * 0.9, 0, rad, rad, rad);
      grad.addColorStop(0, 'rgba(255, 252, 248, 0.92)');
      grad.addColorStop(0.30, 'rgba(248, 242, 235, 0.75)');
      grad.addColorStop(0.60, 'rgba(238, 230, 222, 0.42)');
      grad.addColorStop(0.85, 'rgba(220, 212, 202, 0.12)');
      grad.addColorStop(1, 'rgba(200, 200, 200, 0)');
      s3Ctx.fillStyle = grad;
      s3Ctx.beginPath();
      s3Ctx.arc(rad, rad, rad, 0, Math.PI * 2);
      s3Ctx.fill();
    }

    const sprites = [sprite1, sprite2, sprite3];

    // عدد الجسيمات ومقاساتها بحجم تلفزيوني واضح وكبير
    const PARTICLE_COUNT = 36;
    const particles = [];

    const createParticle = (initialRandomY = false) => {
      // تتوزع سحب الدخان على امتداد عرض الشاشة مع تركيز رائع في الجوانب والوسط
      const spawnX = width * 0.02 + Math.random() * (width * 0.96);
      const spawnY = initialRandomY 
        ? height * 0.1 + Math.random() * (height * 0.9) 
        : height + 30 + Math.random() * 120;

      // حجم سحابة الدخان يبدأ كبيراً للتلفزيون ويتمدد بشكل فخم أثناء الارتفاع
      const baseInitialSize = Math.max(260, width * 0.18) + Math.random() * 220;
      const baseTargetSize = Math.max(550, width * 0.45) + Math.random() * 450;

      return {
        x: spawnX,
        y: spawnY,
        baseX: spawnX,
        sprite: sprites[Math.floor(Math.random() * sprites.length)],
        size: baseInitialSize,
        targetSize: baseTargetSize,
        speedY: 0.55 + Math.random() * 0.75, // سرعة صعود هادئة وطبيعية
        swirlAngle: Math.random() * Math.PI * 2,
        swirlSpeed: 0.007 + Math.random() * 0.014,
        swirlRadius: 40 + Math.random() * 75, // تموج جانبي يماثل حركة الدخان الحقيقي
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.006,
        alpha: 0,
        // شفافية أساسية عالية وملموسة للعين على شاشات التلفزيون الكبيرة (45% - 75%)
        baseMaxAlpha: 0.48 + Math.random() * 0.32,
        life: 0,
        maxLife: 460 + Math.random() * 320
      };
    };

    // تعبئة الشاشة في البداية لتظهر السحب فوراً بدون انتظار
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true));
    }

    const handleResize = () => {
      const p = canvas.parentElement;
      width = canvas.width = p ? p.clientWidth || window.innerWidth : window.innerWidth;
      height = canvas.height = p ? p.clientHeight || window.innerHeight : window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const currentInt = intensityRef.current;
      // معامل القوة نسبة إلى الوضع المتوازن 50%
      const intensityFactor = currentInt / 50;

      if (currentInt > 0) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.life++;

          // حركة الصعود المستمر
          p.y -= p.speedY;

          // التموج اللولبي في الهواء
          p.swirlAngle += p.swirlSpeed;
          p.x = p.baseX + Math.sin(p.swirlAngle) * p.swirlRadius;

          // الدوران البطيء للسحابة
          p.rotation += p.rotSpeed;

          // التمدد التدريجي للسحابة كلما ارتفعت
          const progress = p.life / p.maxLife;
          const currentSize = p.size + (p.targetSize - p.size) * progress;

          // الشفافية والظهور وفق الكثافة والتباين المطلوبين
          // نقوم بزيادة الكثافة حتى تصل لـ 0.90 عند أقصى تباين
          const targetAlpha = Math.min(0.92, p.baseMaxAlpha * intensityFactor);

          // منحنى الشفافية: صعود ناعم ⬅️ وضوح كامل وممتلئ ⬅️ تلاشٍ هادئ في الأعلى
          if (progress < 0.15) {
            p.alpha = (progress / 0.15) * targetAlpha;
          } else if (progress > 0.60) {
            p.alpha = ((1 - progress) / 0.40) * targetAlpha;
          } else {
            p.alpha = targetAlpha;
          }

          if (p.alpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.drawImage(p.sprite, -currentSize / 2, -currentSize / 2, currentSize, currentSize);
            ctx.restore();
          }

          // إعادة تدوير السحابة عندما تنتهي مدتها أو تتجاوز أعلى الشاشة
          if (p.life >= p.maxLife || p.y < -currentSize) {
            particles[i] = createParticle(false);
          }
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

  // حساب شفافية الكانفاس العامة وفق مستوى التباين
  const canvasOpacity = Math.min(1, Math.max(0.3, (numericIntensity / 50) * 0.95));

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {/* طبقة كانفاس دخان الشيشة الحقيقي - بدون mix-blend-mode لضمان ظهور ساطع وقوي على كل متصفحات التلفزيونات الذكية */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
        style={{ 
          opacity: canvasOpacity,
          // تأثير فلتر خفيف لرفع البياض والتباين عند الرغبة
          filter: numericIntensity > 50 
            ? `contrast(${1 + (numericIntensity - 50) * 0.008}) brightness(${1 + (numericIntensity - 50) * 0.005})` 
            : 'none'
        }}
      />

      {/* طبقة ضباب سفلي واضحة توحي بدخان الشيشة المستقر على الطاولات */}
      <div 
        className="absolute inset-x-0 bottom-0 h-64 pointer-events-none bg-gradient-to-t from-white/30 via-white/12 to-transparent transition-opacity duration-500"
        style={{ 
          filter: 'blur(45px)',
          opacity: Math.min(0.9, (numericIntensity / 100) * 0.85)
        }}
      />

      {/* طبقة توهج ناعمة في الزوايا السفلية لعمق سينمائي إضافي */}
      <div 
        className="absolute -bottom-10 left-10 w-96 h-48 rounded-full bg-white/20 pointer-events-none transition-opacity duration-500"
        style={{ filter: 'blur(60px)', opacity: (numericIntensity / 100) * 0.7 }}
      />
      <div 
        className="absolute -bottom-10 right-10 w-96 h-48 rounded-full bg-white/20 pointer-events-none transition-opacity duration-500"
        style={{ filter: 'blur(60px)', opacity: (numericIntensity / 100) * 0.7 }}
      />
    </div>
  );
};
