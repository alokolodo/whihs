-- =====================================================
-- FIX: Clear All Sales Button - Include Account Entries
-- =====================================================
-- This SQL updates the clear_sales_data function to also
-- clear account entries when clearing sales data
-- 
-- Copy and paste this entire file into Owen's Supabase SQL Editor
-- =====================================================

-- Drop and recreate the clear_sales_data function
DROP FUNCTION IF EXISTS public.clear_sales_data(text);

CREATE OR REPLACE FUNCTION public.clear_sales_data(data_type text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER := 0;
  orders_deleted INTEGER := 0;
  bookings_deleted INTEGER := 0;
  game_sessions_deleted INTEGER := 0;
  account_entries_deleted INTEGER := 0;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only administrators can clear sales data';
  END IF;

  -- Clear based on data type
  CASE data_type
    WHEN 'orders' THEN
      -- Clear orders
      DELETE FROM public.orders;
      GET DIAGNOSTICS orders_deleted = ROW_COUNT;
      deleted_count := orders_deleted;
      
    WHEN 'bookings' THEN
      -- Clear room bookings
      DELETE FROM public.room_bookings WHERE payment_status = 'paid';
      GET DIAGNOSTICS bookings_deleted = ROW_COUNT;
      deleted_count := bookings_deleted;
      
    WHEN 'all_sales' THEN
      -- Clear all sales data including accounting entries
      DELETE FROM public.orders;
      GET DIAGNOSTICS orders_deleted = ROW_COUNT;
      
      DELETE FROM public.room_bookings WHERE payment_status = 'paid';
      GET DIAGNOSTICS bookings_deleted = ROW_COUNT;
      
      DELETE FROM public.game_sessions WHERE payment_status = 'paid';
      GET DIAGNOSTICS game_sessions_deleted = ROW_COUNT;
      
      -- Clear all account entries (expenses, income, etc.)
      DELETE FROM public.account_entries;
      GET DIAGNOSTICS account_entries_deleted = ROW_COUNT;
      
      deleted_count := orders_deleted + bookings_deleted + game_sessions_deleted + account_entries_deleted;
      
    ELSE
      RAISE EXCEPTION 'Invalid data type: %', data_type;
  END CASE;

  -- Log the clearing action
  INSERT INTO public.sales_data_clear_log (cleared_by, data_type, record_count)
  VALUES (auth.uid(), data_type, deleted_count);

  result := json_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'orders_deleted', orders_deleted,
    'bookings_deleted', bookings_deleted,
    'game_sessions_deleted', game_sessions_deleted,
    'account_entries_deleted', account_entries_deleted,
    'data_type', data_type
  );

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.clear_sales_data(text) TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this SQL, the "Clear All Sales" button will:
-- ✅ Clear all orders
-- ✅ Clear all paid room bookings
-- ✅ Clear all paid game sessions
-- ✅ Clear all account entries (NEW!)
-- 
-- This means the accounting page will show $0 for:
-- - Total Revenue
-- - Total Expenses
-- - Net Profit
-- - All journal entries
-- =====================================================