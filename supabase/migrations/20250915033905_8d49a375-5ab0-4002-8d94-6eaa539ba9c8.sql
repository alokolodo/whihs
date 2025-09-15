-- Insert mock supplier data
INSERT INTO public.suppliers (
    name, 
    contact_person, 
    email, 
    phone, 
    address, 
    category, 
    rating, 
    payment_terms, 
    tax_id, 
    status
) VALUES 
(
    'Global Coffee Co.',
    'Maria Rodriguez',
    'orders@globalcoffee.com',
    '+1-555-0123',
    '123 Coffee Street, Bean City, BC 12345',
    'Food & Beverages',
    4.8,
    'Net 30',
    'TAX123456789',
    'active'
),
(
    'Linen Supply Ltd.',
    'James Wilson',
    'sales@linensupply.com',
    '+1-555-0456',
    '456 Textile Ave, Fabric Town, FT 67890',
    'Housekeeping',
    4.5,
    'Net 15',
    'TAX987654321',
    'active'
),
(
    'Fine Wine Imports',
    'Sophie Chen',
    'info@finewineimports.com',
    '+1-555-0789',
    '789 Vineyard Road, Wine Valley, WV 13579',
    'Beverages',
    4.9,
    'Net 45',
    'TAX456789123',
    'active'
),
(
    'Hygiene Solutions',
    'Robert Brown',
    'orders@hygienesolutions.com',
    '+1-555-0321',
    '321 Clean Street, Sanitary City, SC 24680',
    'Maintenance',
    4.2,
    'Net 30',
    'TAX321654987',
    'active'
),
(
    'Fresh Foods Direct',
    'Anna Thompson',
    'procurement@freshfoods.com',
    '+1-555-0654',
    '987 Farm Road, Fresh Valley, FV 97531',
    'Food & Beverages',
    4.7,
    'Net 20',
    'TAX654987321',
    'active'
),
(
    'Elite Equipment Corp',
    'Michael Davis',
    'sales@eliteequipment.com',
    '+1-555-0987',
    '654 Industrial Blvd, Tech City, TC 86420',
    'Equipment',
    4.6,
    'Net 30',
    'TAX147258369',
    'active'
),
(
    'Office Supply Hub',
    'Lisa Park',
    'orders@officesupply.com',
    '+1-555-0234',
    '159 Business Ave, Office Park, OP 75319',
    'Office Supplies',
    4.3,
    'Net 15',
    'TAX369258147',
    'active'
),
(
    'Professional Cleaning Co.',
    'David Kim',
    'david@procleaning.com',
    '+1-555-0567',
    '753 Service Road, Clean City, CC 95128',
    'Maintenance',
    4.4,
    'Net 30',
    'TAX852741963',
    'active'
),
(
    'Luxury Amenities Ltd.',
    'Sarah Johnson',
    'sarah@luxuryamenities.com',
    '+1-555-0890',
    '852 Luxury Lane, Premium District, PD 64207',
    'Housekeeping',
    4.8,
    'Net 45',
    'TAX741852963',
    'active'
),
(
    'Organic Farms Collective',
    'Carlos Martinez',
    'carlos@organicfarms.com',
    '+1-555-0345',
    '246 Green Valley Road, Organic Hills, OH 31864',
    'Food & Beverages',
    4.5,
    'Net 30',
    'TAX963852741',
    'active'
),
(
    'Tech Solutions Inc.',
    'Jennifer Wang',
    'jen@techsolutions.com',
    '+1-555-0678',
    '468 Innovation Drive, Silicon Heights, SH 20975',
    'Equipment',
    4.1,
    'Net 60',
    'TAX258369147',
    'pending'
),
(
    'Artisan Bakery Supplies',
    'Francesco Rossi',
    'francesco@artisanbakery.com',
    '+1-555-0901',
    '135 Baker Street, Pastry Town, PT 64208',
    'Food & Beverages',
    4.9,
    'Net 15',
    'TAX159357486',
    'active'
);

-- Insert some sample orders for these suppliers
INSERT INTO public.supplier_orders (
    supplier_id,
    order_number,
    total_amount,
    status,
    order_date,
    delivery_date,
    expected_delivery_date,
    notes,
    created_by
)
SELECT 
    s.id,
    'PO-2024-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    CASE 
        WHEN s.name = 'Global Coffee Co.' THEN 1250.00
        WHEN s.name = 'Linen Supply Ltd.' THEN 890.00
        WHEN s.name = 'Fine Wine Imports' THEN 1680.00
        WHEN s.name = 'Fresh Foods Direct' THEN 2100.00
        WHEN s.name = 'Hygiene Solutions' THEN 450.00
        ELSE 750.00
    END,
    CASE 
        WHEN s.name IN ('Global Coffee Co.', 'Fine Wine Imports') THEN 'delivered'
        WHEN s.name IN ('Fresh Foods Direct', 'Hygiene Solutions') THEN 'confirmed'
        ELSE 'pending'
    END,
    CURRENT_DATE - INTERVAL '5 days',
    CASE 
        WHEN s.name IN ('Global Coffee Co.', 'Fine Wine Imports') THEN CURRENT_DATE - INTERVAL '2 days'
        ELSE NULL
    END,
    CURRENT_DATE + INTERVAL '3 days',
    CASE 
        WHEN s.name = 'Global Coffee Co.' THEN 'Premium blend for VIP guests'
        WHEN s.name = 'Linen Supply Ltd.' THEN 'High thread count sheets for luxury suites'
        WHEN s.name = 'Fine Wine Imports' THEN 'Special vintage selection for wine cellar'
        ELSE 'Standard delivery'
    END,
    'Admin User'
FROM public.suppliers s
WHERE s.name IN ('Global Coffee Co.', 'Linen Supply Ltd.', 'Fine Wine Imports', 'Fresh Foods Direct', 'Hygiene Solutions');

-- Insert sample order items
INSERT INTO public.supplier_order_items (
    order_id,
    item_name,
    quantity,
    unit_price,
    total_price,
    unit,
    description
)
SELECT 
    so.id,
    CASE 
        WHEN s.name = 'Global Coffee Co.' THEN 
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 'Premium Coffee Beans'
                WHEN 2 THEN 'Coffee Filters'
                WHEN 3 THEN 'Sugar Sachets'
            END
        WHEN s.name = 'Linen Supply Ltd.' THEN
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 'Egyptian Cotton Sheets'
                WHEN 2 THEN 'Premium Towels'
                WHEN 3 THEN 'Pillow Cases'
            END
        WHEN s.name = 'Fine Wine Imports' THEN
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 'Bordeaux Red Wine'
                WHEN 2 THEN 'Champagne'
                WHEN 3 THEN 'White Wine Selection'
            END
        WHEN s.name = 'Fresh Foods Direct' THEN
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 'Organic Vegetables'
                WHEN 2 THEN 'Fresh Seafood'
                WHEN 3 THEN 'Prime Beef Cuts'
            END
        WHEN s.name = 'Hygiene Solutions' THEN
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 'Toilet Paper'
                WHEN 2 THEN 'Hand Sanitizer'
                WHEN 3 THEN 'Cleaning Supplies'
            END
    END,
    CASE 
        WHEN s.name = 'Global Coffee Co.' THEN 
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 10
                WHEN 2 THEN 500
                WHEN 3 THEN 1000
            END
        WHEN s.name = 'Linen Supply Ltd.' THEN
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 50
                WHEN 2 THEN 100
                WHEN 3 THEN 75
            END
        ELSE 25
    END,
    CASE 
        WHEN s.name = 'Global Coffee Co.' THEN 
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 85.00
                WHEN 2 THEN 0.25
                WHEN 3 THEN 0.15
            END
        WHEN s.name = 'Linen Supply Ltd.' THEN
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 12.00
                WHEN 2 THEN 3.50
                WHEN 3 THEN 2.80
            END
        ELSE 15.00
    END,
    CASE 
        WHEN s.name = 'Global Coffee Co.' THEN 
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 850.00
                WHEN 2 THEN 125.00
                WHEN 3 THEN 150.00
            END
        WHEN s.name = 'Linen Supply Ltd.' THEN
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 600.00
                WHEN 2 THEN 350.00
                WHEN 3 THEN 210.00
            END
        ELSE 375.00
    END,
    CASE 
        WHEN s.name = 'Global Coffee Co.' THEN 
            CASE (ROW_NUMBER() OVER(PARTITION BY so.id))
                WHEN 1 THEN 'kg'
                WHEN 2 THEN 'pieces'
                WHEN 3 THEN 'pieces'
            END
        WHEN s.name = 'Linen Supply Ltd.' THEN 'pieces'
        ELSE 'units'
    END,
    CASE 
        WHEN s.name = 'Global Coffee Co.' THEN 'Premium quality for hotel restaurant'
        WHEN s.name = 'Linen Supply Ltd.' THEN 'High thread count luxury grade'
        ELSE 'Standard hotel grade'
    END
FROM public.supplier_orders so
JOIN public.suppliers s ON so.supplier_id = s.id
CROSS JOIN generate_series(1, 3) AS item_seq;