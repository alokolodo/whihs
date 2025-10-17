-- Add type field to halls table to distinguish between halls and lounges
ALTER TABLE public.halls 
ADD COLUMN IF NOT EXISTS venue_type text NOT NULL DEFAULT 'hall' CHECK (venue_type IN ('hall', 'lounge'));

-- Add payment tracking fields to hall_bookings
ALTER TABLE public.hall_bookings
ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_history jsonb DEFAULT '[]'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_halls_venue_type ON public.halls(venue_type);
CREATE INDEX IF NOT EXISTS idx_hall_bookings_payment_status ON public.hall_bookings(payment_status);

-- Add comment for documentation
COMMENT ON COLUMN public.halls.venue_type IS 'Type of venue: hall or lounge';
COMMENT ON COLUMN public.hall_bookings.payment_status IS 'Payment status: pending, partial, paid, or refunded';
COMMENT ON COLUMN public.hall_bookings.payment_history IS 'JSON array tracking payment transactions';