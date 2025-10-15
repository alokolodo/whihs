
-- Drop the restrictive INSERT policy on account_entries
DROP POLICY IF EXISTS "Only financial staff can insert account entries" ON public.account_entries;

-- Create a new policy that allows all authenticated hotel staff to insert account entries
CREATE POLICY "Hotel staff can insert account entries"
  ON public.account_entries
  FOR INSERT
  WITH CHECK (has_hotel_staff_access());

-- Drop the restrictive SELECT policy on account_entries
DROP POLICY IF EXISTS "Only financial staff can view account entries" ON public.account_entries;

-- Create a new policy that allows all authenticated hotel staff to view account entries
CREATE POLICY "Hotel staff can view account entries"
  ON public.account_entries
  FOR SELECT
  USING (has_hotel_staff_access());

-- Drop the restrictive UPDATE policy on account_entries  
DROP POLICY IF EXISTS "Only financial staff can update account entries" ON public.account_entries;

-- Create a new policy that allows all authenticated hotel staff to update account entries
CREATE POLICY "Hotel staff can update account entries"
  ON public.account_entries
  FOR UPDATE
  USING (has_hotel_staff_access())
  WITH CHECK (has_hotel_staff_access());

-- Keep DELETE restricted to admins only
