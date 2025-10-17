-- Add rate_type field to halls table to support both hourly and daily rates
ALTER TABLE public.halls 
ADD COLUMN IF NOT EXISTS rate_type text NOT NULL DEFAULT 'hourly' CHECK (rate_type IN ('hourly', 'daily'));

-- Rename hourly_rate to just rate for clarity
ALTER TABLE public.halls 
RENAME COLUMN hourly_rate TO rate;

-- Add comment for documentation
COMMENT ON COLUMN public.halls.rate_type IS 'Rate type: hourly or daily';
COMMENT ON COLUMN public.halls.rate IS 'Rate amount (can be hourly or daily based on rate_type)';