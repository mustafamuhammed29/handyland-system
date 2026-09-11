-- ============================================================
-- HSP HAIR & BEAUTY (HAAR STUDIO PLÖCK) - Supabase Database Setup
-- ============================================================

DROP TABLE IF EXISTS public.hsp_screen1 CASCADE;
DROP TABLE IF EXISTS public.hsp_settings CASCADE;

-- 1. جدول شاشة 1 (شاشة الصالون والعروض / Salon Screen & Offers)
CREATE TABLE public.hsp_screen1 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول إعدادات صالون HSP Hair & Beauty
CREATE TABLE public.hsp_settings (
    id TEXT PRIMARY KEY DEFAULT 'config',
    "logoData" TEXT,
    "faviconData" TEXT,
    "tickerText" TEXT,
    "headerSubtitle" TEXT,
    "intervalScreen1" INTEGER DEFAULT 6,
    "titleScreen1" TEXT DEFAULT 'HSP Hair & Beauty',
    "adminPin" TEXT DEFAULT '0000',
    "cityName" TEXT DEFAULT 'Heidelberg',
    "tickerSpeed" INTEGER DEFAULT 25,
    "fontSize" TEXT DEFAULT '100%',
    "showClock" BOOLEAN DEFAULT true,
    "maintenanceMode" BOOLEAN DEFAULT false,
    "maintenanceMessage" TEXT DEFAULT '',
    "storeStatusMode" TEXT DEFAULT 'active',
    "statusTimerTarget" TEXT DEFAULT '',
    "forceReload" BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. صلاحيات القراءة والكتابة العامة (RLS)
ALTER TABLE public.hsp_screen1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hsp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on hsp_screen1" ON public.hsp_screen1 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on hsp_settings" ON public.hsp_settings FOR ALL USING (true) WITH CHECK (true);

-- 4. تفعيل المزامنة اللحظية (Realtime Replication)
ALTER PUBLICATION supabase_realtime ADD TABLE public.hsp_screen1;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hsp_settings;

-- 5. إدراج الإعدادات الافتراضية الأولية
INSERT INTO public.hsp_settings (
    id, "logoData", "tickerText", "headerSubtitle",
    "titleScreen1", "cityName", "adminPin", "intervalScreen1", "tickerSpeed"
) VALUES (
    'config',
    '/hsp-logo.jpg',
    '*** Willkommen bei HSP Hair & Beauty (Haar Studio Plöck)! *** Ihr exklusiver Friseur- & Beauty-Salon in Heidelberg *** Damen- & Herrenhaarschnitte, Balayage, Styling, Pflege & Kosmetik *** Jetzt Termin vereinbaren! ***',
    'Haar Studio Plöck - Heidelberg',
    'HSP Hair & Beauty',
    'Heidelberg',
    '0000',
    6,
    25
) ON CONFLICT (id) DO NOTHING;

