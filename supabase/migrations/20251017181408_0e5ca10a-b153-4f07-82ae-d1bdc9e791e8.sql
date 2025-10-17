-- Fix RLS by using SECURITY DEFINER functions instead of direct queries
-- This bypasses the RLS chicken-and-egg problem

-- Drop problematic policies
DROP POLICY IF EXISTS "inventory_staff_can_view" ON public.inventory;
DROP POLICY IF EXISTS "inventory_staff_can_insert" ON public.inventory;
DROP POLICY IF EXISTS "inventory_staff_can_update" ON public.inventory;
DROP POLICY IF EXISTS "inventory_admin_can_delete" ON public.inventory;

DROP POLICY IF EXISTS "orders_staff_can_view" ON public.orders;
DROP POLICY IF EXISTS "orders_staff_can_create" ON public.orders;
DROP POLICY IF EXISTS "orders_staff_can_update" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_can_delete" ON public.orders;

DROP POLICY IF EXISTS "tables_staff_can_view" ON public.restaurant_tables;
DROP POLICY IF EXISTS "tables_management_can_manage" ON public.restaurant_tables;

-- Recreate policies using SECURITY DEFINER functions
-- INVENTORY
CREATE POLICY "inventory_staff_access_select"
ON public.inventory FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

CREATE POLICY "inventory_management_insert"
ON public.inventory FOR INSERT
TO authenticated
WITH CHECK (has_management_access() OR has_role(auth.uid(), 'procurement'::app_role));

CREATE POLICY "inventory_management_update"
ON public.inventory FOR UPDATE
TO authenticated
USING (has_management_access() OR has_role(auth.uid(), 'procurement'::app_role));

CREATE POLICY "inventory_admin_delete"
ON public.inventory FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ORDERS
CREATE POLICY "secure_orders_select"
ON public.orders FOR SELECT
TO authenticated
USING (has_booking_access());

CREATE POLICY "secure_orders_insert"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (has_booking_access());

CREATE POLICY "secure_orders_update"
ON public.orders FOR UPDATE
TO authenticated
USING (has_booking_access());

CREATE POLICY "secure_orders_delete"
ON public.orders FOR DELETE
TO authenticated
USING (has_management_access());

-- RESTAURANT TABLES
CREATE POLICY "restaurant_tables_staff_access_select"
ON public.restaurant_tables FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

CREATE POLICY "restaurant_tables_management_modify"
ON public.restaurant_tables FOR INSERT
TO authenticated
WITH CHECK (has_management_access());

CREATE POLICY "restaurant_tables_management_update"
ON public.restaurant_tables FOR UPDATE
TO authenticated
USING (has_management_access());

CREATE POLICY "restaurant_tables_management_delete"
ON public.restaurant_tables FOR DELETE
TO authenticated
USING (has_management_access());