-- Fix security warning by setting proper search_path
CREATE OR REPLACE FUNCTION public.update_inventory_quantity(
    item_name_param TEXT,
    quantity_change INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE public.inventory 
    SET current_quantity = GREATEST(0, current_quantity + quantity_change)
    WHERE item_name = item_name_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item % not found in inventory', item_name_param;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;