-- Create tables for restaurant management
CREATE TABLE public.restaurant_tables (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number TEXT NOT NULL UNIQUE,
    seats INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id UUID REFERENCES public.restaurant_tables(id),
    guest_name TEXT NOT NULL,
    guest_type TEXT NOT NULL CHECK (guest_type IN ('room', 'table', 'standalone')),
    room_number TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    item_category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    special_instructions TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kitchen orders table for items that need kitchen preparation
CREATE TABLE public.kitchen_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    items JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'served')),
    priority INTEGER NOT NULL DEFAULT 1,
    estimated_time INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory table
CREATE TABLE public.inventory (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    item_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'units',
    min_threshold INTEGER NOT NULL DEFAULT 10,
    max_threshold INTEGER NOT NULL DEFAULT 100,
    cost_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
    supplier TEXT,
    last_restocked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - can be restricted based on auth later)
CREATE POLICY "Allow all operations on restaurant_tables" ON public.restaurant_tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on kitchen_orders" ON public.kitchen_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_restaurant_tables_updated_at
    BEFORE UPDATE ON public.restaurant_tables
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kitchen_orders_updated_at
    BEFORE UPDATE ON public.kitchen_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial tables
INSERT INTO public.restaurant_tables (table_number, seats, status) VALUES
('1', 4, 'available'),
('2', 2, 'available'),
('3', 6, 'available'),
('4', 4, 'available'),
('5', 8, 'available'),
('6', 2, 'available'),
('7', 4, 'available'),
('8', 6, 'available');

-- Insert sample inventory items for beverages and common items
INSERT INTO public.inventory (item_name, category, current_quantity, unit, min_threshold, cost_per_unit) VALUES
('Coca Cola', 'Soft Drinks', 50, 'bottles', 10, 2.50),
('Pepsi', 'Soft Drinks', 45, 'bottles', 10, 2.50),
('Orange Juice', 'Soft Drinks', 30, 'bottles', 5, 3.00),
('Apple Juice', 'Soft Drinks', 25, 'bottles', 5, 3.00),
('Water', 'Soft Drinks', 100, 'bottles', 20, 1.00),
('Beer', 'Alcoholic Beverages', 60, 'bottles', 15, 4.00),
('White Wine', 'Alcoholic Beverages', 20, 'bottles', 5, 25.00),
('Red Wine', 'Alcoholic Beverages', 18, 'bottles', 5, 28.00),
('Vodka', 'Spirits', 10, 'bottles', 2, 45.00),
('Whiskey', 'Spirits', 8, 'bottles', 2, 55.00),
('Coffee Beans', 'Hot Beverages', 5, 'kg', 1, 15.00),
('Tea Bags', 'Hot Beverages', 200, 'pieces', 50, 0.25);

-- Enable realtime for all tables
ALTER TABLE public.restaurant_tables REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER TABLE public.kitchen_orders REPLICA IDENTITY FULL;
ALTER TABLE public.inventory REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kitchen_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;