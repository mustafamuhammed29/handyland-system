-- ============================================================
-- KANKA ORIENT DELUXE HEIDELBERG - Supabase Database Setup
-- ============================================================

DROP TABLE IF EXISTS public.kanka_screen1 CASCADE;
DROP TABLE IF EXISTS public.kanka_screen2 CASCADE;
DROP TABLE IF EXISTS public.kanka_screen3 CASCADE;
DROP TABLE IF EXISTS public.kanka_settings CASCADE;

-- 1. جدول شاشة 1 (الشيشة والتبغ الفاخر / Shisha & Tabak)
CREATE TABLE public.kanka_screen1 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول شاشة 2 (المشروبات والكوكتيلات / Getränke & Cocktails)
CREATE TABLE public.kanka_screen2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول شاشة 3 (العروض والفعاليات / Angebote & Events)
CREATE TABLE public.kanka_screen3 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول إعدادات كافتيريا كانكا أورينت ديلوكس (Kanka Orient Deluxe Settings)
CREATE TABLE public.kanka_settings (
    id TEXT PRIMARY KEY DEFAULT 'config',
    "logoData" TEXT,
    "faviconData" TEXT,
    "tickerText" TEXT,
    "headerSubtitle" TEXT,
    "intervalScreen1" INTEGER DEFAULT 6,
    "intervalScreen2" INTEGER DEFAULT 6,
    "intervalScreen3" INTEGER DEFAULT 6,
    "titleScreen1" TEXT DEFAULT '',
    "titleScreen2" TEXT DEFAULT '',
    "titleScreen3" TEXT DEFAULT '',
    "adminPin" TEXT DEFAULT '0000',
    "cityName" TEXT DEFAULT 'Heidelberg',
    "tickerSpeed" INTEGER DEFAULT 25,
    "fontSize" TEXT DEFAULT '100%',
    "showClock" BOOLEAN DEFAULT true,
    "smokeIntensity" INTEGER DEFAULT 50,
    "maintenanceMode" BOOLEAN DEFAULT false,
    "maintenanceMessage" TEXT DEFAULT '',
    "storeStatusMode" TEXT DEFAULT 'active',
    "statusTimerTarget" TEXT DEFAULT '',
    "forceReload" BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. صلاحيات القراءة والكتابة العامة (RLS)
ALTER TABLE public.kanka_screen1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanka_screen2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanka_screen3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanka_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on kanka_screen1" ON public.kanka_screen1 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on kanka_screen2" ON public.kanka_screen2 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on kanka_screen3" ON public.kanka_screen3 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on kanka_settings" ON public.kanka_settings FOR ALL USING (true) WITH CHECK (true);

-- 6. تفعيل المزامنة اللحظية (Realtime Replication)
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanka_screen1;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanka_screen2;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanka_screen3;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanka_settings;
