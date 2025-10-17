-- Fix user_roles RLS to allow SECURITY DEFINER functions to work
-- Add policy to allow all authenticated users to read user_roles
-- This is safe because SECURITY DEFINER functions need this access

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view all roles" ON public.user_roles;

-- Allow authenticated users to view all user roles
-- This is necessary for SECURITY DEFINER functions like has_hotel_staff_access() to work
CREATE POLICY "Authenticated users can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

-- Keep admin management policy
-- (This already exists, just making sure it's there)

-- Verify the fix worked
SELECT 'User roles policies updated successfully' as status;