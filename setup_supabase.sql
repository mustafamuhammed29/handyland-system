-- ============================================================
-- HANDYLAND Digital Signage - Complete Supabase Database Setup
-- ============================================================

DROP TABLE IF EXISTS public.shop_devices CASCADE;
DROP TABLE IF EXISTS public.shop_repairs CASCADE;
DROP TABLE IF EXISTS public.shop_offers CASCADE;
DROP TABLE IF EXISTS public.shop_settings CASCADE;

-- 1. جدول شاشة 1 (الأجهزة)
CREATE TABLE public.shop_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول شاشة 2 (الصيانة)
CREATE TABLE public.shop_repairs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول شاشة 3 (العروض)
CREATE TABLE public.shop_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول إعدادات المحل الكاملة (المدينة الافتراضية Heidelberg)
CREATE TABLE public.shop_settings (
    id TEXT PRIMARY KEY DEFAULT 'config',
    "logoData" TEXT,
    "tickerText" TEXT,
    "headerSubtitle" TEXT,
    "slideInterval" INTEGER DEFAULT 6,
    "intervalScreen1" INTEGER DEFAULT 6,
    "intervalScreen2" INTEGER DEFAULT 6,
    "intervalScreen3" INTEGER DEFAULT 6,
    "adminPin" TEXT DEFAULT '1234',
    "cityName" TEXT DEFAULT 'Heidelberg',
    "showClock" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. صلاحيات القراءة والكتابة العامة
ALTER TABLE public.shop_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on shop_devices" ON public.shop_devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on shop_repairs" ON public.shop_repairs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on shop_offers" ON public.shop_offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on shop_settings" ON public.shop_settings FOR ALL USING (true) WITH CHECK (true);

-- 6. تفعيل المزامنة اللحظية
ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_repairs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_settings;
