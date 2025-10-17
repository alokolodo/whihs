-- =====================================================
-- FINANCIAL SUMMARY FIX - Include Inventory in Assets
-- =====================================================
-- This SQL updates the financial calculations to properly
-- include inventory value in total assets
-- 
-- Simply copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.financial_summary CASCADE;

-- Create a comprehensive financial summary view
CREATE OR REPLACE VIEW public.financial_summary AS
WITH revenue_data AS (
  -- Room booking revenue
  SELECT 
    COALESCE(SUM(total_amount), 0) as room_revenue
  FROM public.room_bookings
  WHERE payment_status = 'paid'
  
  UNION ALL
  
  -- POS/Restaurant revenue
  SELECT 
    COALESCE(SUM(total_amount), 0) as pos_revenue
  FROM public.orders
  WHERE status = 'paid'
  
  UNION ALL
  
  -- Game center revenue
  SELECT 
    COALESCE(SUM(total_amount), 0) as game_revenue
  FROM public.game_sessions
  WHERE payment_status = 'paid'
),
accounting_data AS (
  SELECT 
    COALESCE(SUM(CASE WHEN ac.type = 'expense' THEN ABS(ae.amount) ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN ac.type = 'asset' THEN ABS(ae.amount) ELSE 0 END), 0) as total_assets_entries,
    COALESCE(SUM(CASE WHEN ac.type = 'liability' THEN ABS(ae.amount) ELSE 0 END), 0) as total_liabilities,
    COALESCE(SUM(CASE WHEN ac.type = 'equity' THEN ABS(ae.amount) ELSE 0 END), 0) as total_equity
  FROM public.account_entries ae
  LEFT JOIN public.account_categories ac ON ae.category_id = ac.id
  WHERE ae.status IN ('posted', 'pending')
),
inventory_value AS (
  -- Calculate total inventory value (quantity * cost per unit)
  SELECT 
    COALESCE(SUM(current_quantity * cost_per_unit), 0) as inventory_asset_value
  FROM public.inventory
  WHERE current_quantity > 0
)
SELECT 
  (SELECT SUM(room_revenue) FROM revenue_data) as total_revenue,
  ad.total_expenses,
  (ad.total_assets_entries + iv.inventory_asset_value) as total_assets,
  ad.total_liabilities,
  ad.total_equity,
  ((SELECT SUM(room_revenue) FROM revenue_data) - ad.total_expenses) as net_income,
  iv.inventory_asset_value
FROM accounting_data ad
CROSS JOIN inventory_value iv;

-- Grant access to authenticated users
GRANT SELECT ON public.financial_summary TO authenticated;

-- Create or replace function to get financial summary
CREATE OR REPLACE FUNCTION public.get_financial_summary()
RETURNS TABLE (
  total_revenue numeric,
  total_expenses numeric,
  total_assets numeric,
  total_liabilities numeric,
  total_equity numeric,
  net_income numeric,
  inventory_value numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    total_revenue,
    total_expenses,
    total_assets,
    total_liabilities,
    total_equity,
    net_income,
    inventory_asset_value
  FROM public.financial_summary;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_financial_summary() TO authenticated;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify the fix is working:
-- 
-- SELECT * FROM public.financial_summary;
-- 
-- You should now see:
-- - total_revenue: Sum of all paid bookings, orders, and game sessions
-- - total_expenses: Sum of all expense account entries
-- - total_assets: Sum of asset entries + inventory value
-- - net_income: total_revenue - total_expenses
-- - inventory_value: Total value of all inventory items
-- =====================================================