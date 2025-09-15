-- Create suppliers table
CREATE TABLE public.suppliers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    category TEXT NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    payment_terms TEXT DEFAULT 'Net 30',
    tax_id TEXT,
    total_orders INTEGER DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    last_order_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_orders table
CREATE TABLE public.supplier_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    expected_delivery_date DATE,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_order_items table
CREATE TABLE public.supplier_order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.supplier_orders(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    unit TEXT NOT NULL DEFAULT 'units',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_payments table
CREATE TABLE public.supplier_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.supplier_orders(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_number TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for suppliers
CREATE POLICY "Allow all operations on suppliers" 
ON public.suppliers 
FOR ALL 
USING (true);

-- Create RLS policies for supplier_orders
CREATE POLICY "Allow all operations on supplier_orders" 
ON public.supplier_orders 
FOR ALL 
USING (true);

-- Create RLS policies for supplier_order_items
CREATE POLICY "Allow all operations on supplier_order_items" 
ON public.supplier_order_items 
FOR ALL 
USING (true);

-- Create RLS policies for supplier_payments
CREATE POLICY "Allow all operations on supplier_payments" 
ON public.supplier_payments 
FOR ALL 
USING (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_orders_updated_at
    BEFORE UPDATE ON public.supplier_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update supplier statistics
CREATE OR REPLACE FUNCTION public.update_supplier_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update supplier total orders and amount when order is confirmed or delivered
    IF NEW.status IN ('confirmed', 'delivered') AND (OLD.status != NEW.status OR OLD IS NULL) THEN
        UPDATE public.suppliers 
        SET 
            total_orders = (
                SELECT COUNT(*) 
                FROM public.supplier_orders 
                WHERE supplier_id = NEW.supplier_id 
                AND status IN ('confirmed', 'delivered')
            ),
            total_amount = (
                SELECT COALESCE(SUM(total_amount), 0) 
                FROM public.supplier_orders 
                WHERE supplier_id = NEW.supplier_id 
                AND status IN ('confirmed', 'delivered')
            ),
            last_order_date = NEW.order_date
        WHERE id = NEW.supplier_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for supplier statistics
CREATE TRIGGER update_supplier_stats_trigger
    AFTER INSERT OR UPDATE ON public.supplier_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_supplier_stats();

-- Create function to calculate order total from items
CREATE OR REPLACE FUNCTION public.update_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update order total when items are added/updated/deleted
    UPDATE public.supplier_orders 
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM public.supplier_order_items 
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for order total calculation
CREATE TRIGGER update_order_total_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.supplier_order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_total();