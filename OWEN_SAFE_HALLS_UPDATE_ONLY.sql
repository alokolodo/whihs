-- =====================================================
-- SAFE HALLS/LOUNGES UPDATE ONLY
-- This ONLY updates the halls table - NO OTHER TABLES
-- Your inventory and all other data is 100% SAFE
-- =====================================================

-- Add the new columns to halls table if they don't exist
DO $$ 
BEGIN
    -- Add rate_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'halls' AND column_name = 'rate_type'
    ) THEN
        ALTER TABLE public.halls 
        ADD COLUMN rate_type text NOT NULL DEFAULT 'hourly';
        
        ALTER TABLE public.halls 
        ADD CONSTRAINT halls_rate_type_check 
        CHECK (rate_type IN ('hourly', 'daily'));
    END IF;

    -- Rename hourly_rate to rate if hourly_rate exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'halls' AND column_name = 'hourly_rate'
    ) THEN
        ALTER TABLE public.halls 
        RENAME COLUMN hourly_rate TO rate;
    END IF;
END $$;

-- =====================================================
-- THAT'S IT! Only halls table updated.
-- Your inventory, orders, bookings, etc. are untouched!
-- =====================================================
