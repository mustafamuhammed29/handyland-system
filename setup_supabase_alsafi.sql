-- ============================================================
-- ALSAFI Digital Signage - Supabase Database Setup
-- ============================================================

DROP TABLE IF EXISTS public.alsafi_menu CASCADE;
DROP TABLE IF EXISTS public.alsafi_drinks CASCADE;
DROP TABLE IF EXISTS public.alsafi_offers CASCADE;
DROP TABLE IF EXISTS public.alsafi_settings CASCADE;

-- 1. جدول شاشة 1 (المنيو)
CREATE TABLE public.alsafi_menu (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول شاشة 2 (المشروبات)
CREATE TABLE public.alsafi_drinks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول شاشة 3 (العروض)
CREATE TABLE public.alsafi_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول إعدادات مطعم الصافي
CREATE TABLE public.alsafi_settings (
    id TEXT PRIMARY KEY DEFAULT 'config',
    "logoData" TEXT,
    "faviconData" TEXT,
    "tickerText" TEXT,
    "headerSubtitle" TEXT,
    "intervalScreen1" INTEGER DEFAULT 6,
    "intervalScreen2" INTEGER DEFAULT 6,
    "intervalScreen3" INTEGER DEFAULT 6,
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

-- 5. صلاحيات القراءة والكتابة العامة
ALTER TABLE public.alsafi_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alsafi_drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alsafi_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alsafi_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on alsafi_menu" ON public.alsafi_menu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on alsafi_drinks" ON public.alsafi_drinks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on alsafi_offers" ON public.alsafi_offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on alsafi_settings" ON public.alsafi_settings FOR ALL USING (true) WITH CHECK (true);

-- 6. تفعيل المزامنة اللحظية
ALTER PUBLICATION supabase_realtime ADD TABLE public.alsafi_menu;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alsafi_drinks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alsafi_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alsafi_settings;
