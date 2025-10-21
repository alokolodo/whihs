-- =====================================================
-- EXPENSE CATEGORIES HIERARCHY MIGRATION
-- =====================================================
-- This SQL creates hierarchical expense categories:
-- Total Expenses
--   ├─ Kitchen
--   │   ├─ Utilities
--   │   ├─ Spices
--   │   └─ Assets/Repairs
--   └─ Hotel
--       ├─ Utilities
--       └─ Assets/Repairs
-- =====================================================

-- First, ensure we have the expense type parent category
DO $$
DECLARE
  v_total_expenses_id uuid;
  v_kitchen_id uuid;
  v_hotel_id uuid;
BEGIN
  -- Create or get Total Expenses parent category
  INSERT INTO public.account_categories (name, type, account_code, description, parent_id, is_active)
  VALUES ('Total Expenses', 'expense', '5000', 'All expense categories', NULL, true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_total_expenses_id;
  
  -- If already exists, get the ID
  IF v_total_expenses_id IS NULL THEN
    SELECT id INTO v_total_expenses_id 
    FROM public.account_categories 
    WHERE name = 'Total Expenses' AND type = 'expense';
  END IF;

  -- Create Kitchen category
  INSERT INTO public.account_categories (name, type, account_code, description, parent_id, is_active)
  VALUES ('Kitchen', 'expense', '5100', 'Kitchen-related expenses', v_total_expenses_id, true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_kitchen_id;
  
  IF v_kitchen_id IS NULL THEN
    SELECT id INTO v_kitchen_id 
    FROM public.account_categories 
    WHERE name = 'Kitchen' AND type = 'expense' AND parent_id = v_total_expenses_id;
  END IF;

  -- Create Hotel category
  INSERT INTO public.account_categories (name, type, account_code, description, parent_id, is_active)
  VALUES ('Hotel', 'expense', '5200', 'Hotel-related expenses', v_total_expenses_id, true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_hotel_id;
  
  IF v_hotel_id IS NULL THEN
    SELECT id INTO v_hotel_id 
    FROM public.account_categories 
    WHERE name = 'Hotel' AND type = 'expense' AND parent_id = v_total_expenses_id;
  END IF;

  -- Create Kitchen subcategories
  INSERT INTO public.account_categories (name, type, account_code, description, parent_id, is_active)
  VALUES 
    ('Kitchen - Utilities', 'expense', '5110', 'Kitchen utilities (electricity, water, gas)', v_kitchen_id, true),
    ('Kitchen - Spices', 'expense', '5120', 'Spices and seasonings', v_kitchen_id, true),
    ('Kitchen - Assets/Repairs', 'expense', '5130', 'Kitchen equipment and repairs', v_kitchen_id, true)
  ON CONFLICT DO NOTHING;

  -- Create Hotel subcategories
  INSERT INTO public.account_categories (name, type, account_code, description, parent_id, is_active)
  VALUES 
    ('Hotel - Utilities', 'expense', '5210', 'Hotel utilities (electricity, water, internet)', v_hotel_id, true),
    ('Hotel - Assets/Repairs', 'expense', '5220', 'Hotel equipment, furniture and repairs', v_hotel_id, true)
  ON CONFLICT DO NOTHING;

END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify the hierarchy was created:
-- 
-- SELECT 
--   c1.name as parent,
--   c1.account_code as parent_code,
--   c2.name as child,
--   c2.account_code as child_code,
--   c3.name as grandchild,
--   c3.account_code as grandchild_code
-- FROM account_categories c1
-- LEFT JOIN account_categories c2 ON c2.parent_id = c1.id
-- LEFT JOIN account_categories c3 ON c3.parent_id = c2.id
-- WHERE c1.name = 'Total Expenses'
-- ORDER BY c2.account_code, c3.account_code;
-- =====================================================
