-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.update_monthly_winner()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to automatically update winners
  -- when voting period ends (to be called manually or via cron)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;