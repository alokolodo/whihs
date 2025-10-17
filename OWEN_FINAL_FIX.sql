-- =====================================================
-- OWEN'S FINAL FIX - Run this in Supabase SQL Editor
-- This updates ONLY the halls table to support daily/hourly rates
-- =====================================================

-- Step 1: Add rate_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'halls' 
        AND column_name = 'rate_type'
    ) THEN
        ALTER TABLE public.halls 
        ADD COLUMN rate_type text NOT NULL DEFAULT 'hourly';
        
        ALTER TABLE public.halls 
        ADD CONSTRAINT halls_rate_type_check 
        CHECK (rate_type IN ('hourly', 'daily'));
        
        RAISE NOTICE 'Added rate_type column to halls table';
    ELSE
        RAISE NOTICE 'rate_type column already exists';
    END IF;
END $$;

-- Step 2: Rename hourly_rate to rate if hourly_rate exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'halls' 
        AND column_name = 'hourly_rate'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'halls' 
        AND column_name = 'rate'
    ) THEN
        ALTER TABLE public.halls 
        RENAME COLUMN hourly_rate TO rate;
        
        RAISE NOTICE 'Renamed hourly_rate to rate';
    ELSE
        RAISE NOTICE 'Column already renamed or rate column exists';
    END IF;
END $$;

-- Step 3: Verify the changes
SELECT 
    'halls' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'halls'
AND column_name IN ('rate', 'rate_type', 'hourly_rate')
ORDER BY column_name;

-- =====================================================
-- DONE! Your halls table now supports daily/hourly rates
-- All other tables (inventory, orders, etc.) are untouched
-- =====================================================
