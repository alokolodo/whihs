-- Enable RLS on menu_items if not already enabled
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "menu_items_staff_access_select" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_management_modify" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_management_update" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_management_delete" ON public.menu_items;

-- Staff can view all menu items
CREATE POLICY "menu_items_staff_access_select" ON public.menu_items
FOR SELECT USING (has_hotel_staff_access());

-- Management can insert menu items
CREATE POLICY "menu_items_management_insert" ON public.menu_items
FOR INSERT WITH CHECK (has_management_access() OR has_role(auth.uid(), 'kitchen'::app_role));

-- Management and kitchen can update menu items
CREATE POLICY "menu_items_management_update" ON public.menu_items
FOR UPDATE USING (
  has_management_access() OR has_role(auth.uid(), 'kitchen'::app_role)
) WITH CHECK (
  has_management_access() OR has_role(auth.uid(), 'kitchen'::app_role)
);

-- Only admins can delete menu items
CREATE POLICY "menu_items_management_delete" ON public.menu_items
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));