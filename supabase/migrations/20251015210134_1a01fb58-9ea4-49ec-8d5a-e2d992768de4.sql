
-- Drop the restrictive SELECT policy on account_categories
DROP POLICY IF EXISTS "Only financial staff can view account categories" ON public.account_categories;

-- Create a new policy that allows all authenticated hotel staff to view account categories
-- But only financial staff can modify them
CREATE POLICY "Hotel staff can view account categories"
  ON public.account_categories
  FOR SELECT
  USING (has_hotel_staff_access());

-- Keep the restrictive policies for INSERT, UPDATE, DELETE (only for financial staff)
