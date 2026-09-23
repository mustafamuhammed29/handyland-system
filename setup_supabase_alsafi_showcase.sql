-- ============================================================
-- ALSAFI Dish & Ingredients Showcase Screen Setup (Supabase)
-- شاشة استعراض الأطباق والمكونات التفاعلية لمطعم الصافي
-- ============================================================

-- 1. إنشاء جدول أطباق ومكونات شاشة العرض التفاعلية
CREATE TABLE IF NOT EXISTS public.alsafi_showcase (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "imageData" TEXT NOT NULL,
    "title" TEXT DEFAULT '',
    "description" TEXT DEFAULT '',
    "price" TEXT DEFAULT '',
    "ingredients" JSONB DEFAULT '[]'::jsonb,
    "badge" TEXT DEFAULT '',
    "calories" TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ترقية جدول إعدادات الصافي لإضافة فاصل وعنوان الشاشة الرابعة إن لم يكونا موجودين
ALTER TABLE public.alsafi_settings 
ADD COLUMN IF NOT EXISTS "intervalScreen4" INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS "titleScreen4" TEXT DEFAULT '';

-- 3. تفعيل الحماية وسياسة الوصول العام للجدول الجديد
ALTER TABLE public.alsafi_showcase ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'alsafi_showcase' 
        AND policyname = 'Allow public read/write on alsafi_showcase'
    ) THEN
        CREATE POLICY "Allow public read/write on alsafi_showcase" 
        ON public.alsafi_showcase FOR ALL 
        USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 4. تفعيل المزامنة اللحظية (Realtime) للجدول
ALTER PUBLICATION supabase_realtime ADD TABLE public.alsafi_showcase;
