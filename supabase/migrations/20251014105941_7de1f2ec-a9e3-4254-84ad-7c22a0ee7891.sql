-- Fix RLS helper functions to check user_roles table instead of profiles.role

CREATE OR REPLACE FUNCTION public.has_hotel_staff_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping', 'kitchen', 'procurement', 'bartender', 'supervisor', 'maintenance', 'security')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_management_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'supervisor')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_hr_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr', 'manager')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_financial_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'accounting', 'hr')
  );
END;
$$;

-- Also update inventory policies to use the fixed functions
DROP POLICY IF EXISTS "inventory_management_insert" ON public.inventory;
CREATE POLICY "inventory_management_insert" ON public.inventory
FOR INSERT WITH CHECK (
  has_management_access() OR 
  has_role(auth.uid(), 'procurement'::app_role)
);

DROP POLICY IF EXISTS "inventory_management_update" ON public.inventory;
CREATE POLICY "inventory_management_update" ON public.inventory
FOR UPDATE USING (
  has_management_access() OR 
  has_role(auth.uid(), 'procurement'::app_role)
) WITH CHECK (
  has_management_access() OR 
  has_role(auth.uid(), 'procurement'::app_role)
);

DROP POLICY IF EXISTS "inventory_admin_delete" ON public.inventory;
CREATE POLICY "inventory_admin_delete" ON public.inventory
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "hotel_settings_admin_only_delete" ON public.hotel_settings;
CREATE POLICY "hotel_settings_admin_only_delete" ON public.hotel_settings
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete account categories" ON public.account_categories;
CREATE POLICY "Only admins can delete account categories" ON public.account_categories
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete account entries" ON public.account_entries;
CREATE POLICY "Only admins can delete account entries" ON public.account_entries
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete financial reports" ON public.financial_reports;
CREATE POLICY "Only admins can delete financial reports" ON public.financial_reports
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete budgets" ON public.budgets;
CREATE POLICY "Only admins can delete budgets" ON public.budgets
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));