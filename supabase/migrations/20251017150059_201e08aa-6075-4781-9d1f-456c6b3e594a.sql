-- Fix RLS policies for inventory, orders, and restaurant_tables
-- This resolves 403 errors on frontend

-- First, verify user has admin role (for debugging)
-- If this returns a row, user should have full access
-- SELECT * FROM public.user_roles WHERE user_id = auth.uid();

-- Fix inventory table RLS policies
DROP POLICY IF EXISTS "inventory_staff_access_select" ON public.inventory;
DROP POLICY IF EXISTS "inventory_management_insert" ON public.inventory;
DROP POLICY IF EXISTS "inventory_management_update" ON public.inventory;
DROP POLICY IF EXISTS "inventory_admin_delete" ON public.inventory;

CREATE POLICY "inventory_staff_can_view"
ON public.inventory FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'staff', 'procurement', 'kitchen', 'housekeeping', 'bartender')
  )
);

CREATE POLICY "inventory_staff_can_insert"
ON public.inventory FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'procurement')
  )
);

CREATE POLICY "inventory_staff_can_update"
ON public.inventory FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'procurement', 'staff')
  )
);

CREATE POLICY "inventory_admin_can_delete"
ON public.inventory FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Fix orders table RLS policies
DROP POLICY IF EXISTS "secure_orders_select" ON public.orders;
DROP POLICY IF EXISTS "secure_orders_insert" ON public.orders;
DROP POLICY IF EXISTS "secure_orders_update" ON public.orders;
DROP POLICY IF EXISTS "secure_orders_delete" ON public.orders;

CREATE POLICY "orders_staff_can_view"
ON public.orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'staff', 'kitchen', 'bartender', 'front_desk')
  )
);

CREATE POLICY "orders_staff_can_create"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'staff', 'bartender', 'front_desk')
  )
);

CREATE POLICY "orders_staff_can_update"
ON public.orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'staff', 'bartender', 'front_desk')
  )
);

CREATE POLICY "orders_admin_can_delete"
ON public.orders FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Fix restaurant_tables RLS policies
DROP POLICY IF EXISTS "restaurant_tables_staff_access_select" ON public.restaurant_tables;
DROP POLICY IF EXISTS "restaurant_tables_management_modify" ON public.restaurant_tables;
DROP POLICY IF EXISTS "restaurant_tables_management_update" ON public.restaurant_tables;
DROP POLICY IF EXISTS "restaurant_tables_management_delete" ON public.restaurant_tables;

CREATE POLICY "tables_staff_can_view"
ON public.restaurant_tables FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'staff', 'bartender', 'front_desk')
  )
);

CREATE POLICY "tables_management_can_manage"
ON public.restaurant_tables FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Verify user_roles and ensure RLS is enabled
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;