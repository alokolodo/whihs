-- =====================================================
-- OWEN'S COMPLETE FINANCIAL SYSTEM FIX
-- =====================================================
-- This SQL file contains all fixes for:
-- 1. Including inventory value in total assets
-- 2. Updating expense status values
-- 3. Ensuring all financial calculations are correct
-- 
-- Simply copy and paste this ENTIRE file into Owen's Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: Update Account Entries Status Column
-- =====================================================
-- Update the status column to use the new payment status values

-- First, update existing data to new status values
UPDATE public.account_entries 
SET status = 'paid_transfer' 
WHERE status = 'posted';

UPDATE public.account_entries 
SET status = 'paid_cash' 
WHERE status = 'pending';

UPDATE public.account_entries 
SET status = 'refund_cash' 
WHERE status = 'reconciled';

-- Note: You may want to review and manually update specific records
-- based on your actual payment methods

-- =====================================================
-- PART 2: Financial Summary View with Inventory
-- =====================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.financial_summary CASCADE;

-- Create comprehensive financial summary view with inventory
CREATE OR REPLACE VIEW public.financial_summary AS
WITH revenue_data AS (
  -- Room booking revenue
  SELECT COALESCE(SUM(total_amount), 0) as revenue_amount
  FROM public.room_bookings
  WHERE payment_status = 'paid'
  
  UNION ALL
  
  -- POS/Restaurant revenue
  SELECT COALESCE(SUM(total_amount), 0) as revenue_amount
  FROM public.orders
  WHERE status = 'paid'
  
  UNION ALL
  
  -- Game center revenue
  SELECT COALESCE(SUM(total_amount), 0) as revenue_amount
  FROM public.game_sessions
  WHERE payment_status = 'paid'
),
accounting_data AS (
  SELECT 
    -- Sum all expenses (paid_transfer, paid_cash, refund_cash, refund_transfer)
    COALESCE(SUM(CASE WHEN ac.type = 'expense' THEN ABS(ae.amount) ELSE 0 END), 0) as total_expenses,
    -- Sum all asset entries
    COALESCE(SUM(CASE WHEN ac.type = 'asset' THEN ABS(ae.amount) ELSE 0 END), 0) as total_assets_entries,
    -- Sum all liabilities
    COALESCE(SUM(CASE WHEN ac.type = 'liability' THEN ABS(ae.amount) ELSE 0 END), 0) as total_liabilities,
    -- Sum all equity
    COALESCE(SUM(CASE WHEN ac.type = 'equity' THEN ABS(ae.amount) ELSE 0 END), 0) as total_equity
  FROM public.account_entries ae
  LEFT JOIN public.account_categories ac ON ae.category_id = ac.id
  WHERE ae.status IN ('paid_transfer', 'paid_cash', 'refund_cash', 'refund_transfer', 'posted', 'pending')
),
inventory_value AS (
  -- Calculate total inventory value (quantity * cost per unit)
  SELECT 
    COALESCE(SUM(current_quantity * cost_per_unit), 0) as inventory_asset_value
  FROM public.inventory
  WHERE current_quantity > 0
)
SELECT 
  -- Total Revenue from all sources
  (SELECT SUM(revenue_amount) FROM revenue_data) as total_revenue,
  
  -- Total Expenses
  ad.total_expenses,
  
  -- Total Assets = Asset Entries + Inventory Value
  (ad.total_assets_entries + iv.inventory_asset_value) as total_assets,
  
  -- Total Liabilities
  ad.total_liabilities,
  
  -- Total Equity
  ad.total_equity,
  
  -- Net Income = Revenue - Expenses
  ((SELECT SUM(revenue_amount) FROM revenue_data) - ad.total_expenses) as net_income,
  
  -- Inventory Value (for reference)
  iv.inventory_asset_value as inventory_value
FROM accounting_data ad
CROSS JOIN inventory_value iv;

-- Grant access to authenticated users
GRANT SELECT ON public.financial_summary TO authenticated;

-- =====================================================
-- PART 3: Financial Summary Function
-- =====================================================

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
    inventory_value
  FROM public.financial_summary;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_financial_summary() TO authenticated;

-- =====================================================
-- PART 4: Update RLS Policies for Account Entries
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Financial staff can view account entries" ON public.account_entries;
DROP POLICY IF EXISTS "Financial staff can insert account entries" ON public.account_entries;
DROP POLICY IF EXISTS "Financial staff can update account entries" ON public.account_entries;
DROP POLICY IF EXISTS "Only admins can delete account entries" ON public.account_entries;

-- Recreate RLS policies for account_entries
CREATE POLICY "Financial staff can view account entries"
ON public.account_entries
FOR SELECT
TO authenticated
USING (has_financial_access());

CREATE POLICY "Financial staff can insert account entries"
ON public.account_entries
FOR INSERT
TO authenticated
WITH CHECK (has_financial_access());

CREATE POLICY "Financial staff can update account entries"
ON public.account_entries
FOR UPDATE
TO authenticated
USING (has_financial_access())
WITH CHECK (has_financial_access());

CREATE POLICY "Only admins can delete account entries"
ON public.account_entries
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the fix is working:

-- 1. Check financial summary
-- SELECT * FROM public.financial_summary;

-- 2. Check inventory value calculation
-- SELECT 
--   SUM(current_quantity * cost_per_unit) as total_inventory_value
-- FROM public.inventory
-- WHERE current_quantity > 0;

-- 3. Check account entries with new status values
-- SELECT status, COUNT(*) as count
-- FROM public.account_entries
-- GROUP BY status;

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- After running this SQL, you should see:
-- 
-- ✅ total_revenue: Sum of all paid bookings, orders, and game sessions
-- ✅ total_expenses: Sum of all expense account entries
-- ✅ total_assets: Sum of asset entries + inventory value
-- ✅ total_liabilities: Sum of liability entries
-- ✅ total_equity: Sum of equity entries
-- ✅ net_income: total_revenue - total_expenses
-- ✅ inventory_value: Total value of all inventory items
-- 
-- ✅ Status values in account_entries:
--    - paid_transfer (Paid with Transfer)
--    - paid_cash (Paid with Cash)
--    - refund_cash (Refund to Customer with Cash)
--    - refund_transfer (Refund to Customer with Transfer)
-- =====================================================