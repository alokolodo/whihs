-- Create missing positions table
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES public.departments(id),
  base_salary NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on positions
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Positions policies
CREATE POLICY "HR can view all positions"
  ON public.positions FOR SELECT
  USING (has_hr_access());

CREATE POLICY "HR can manage positions"
  ON public.positions FOR ALL
  USING (has_hr_access())
  WITH CHECK (has_hr_access());

-- Insert default positions
INSERT INTO public.positions (name, code, department_id, base_salary) VALUES
  ('General Manager', 'GM', (SELECT id FROM departments WHERE code = 'MG'), 5000),
  ('Front Desk Manager', 'FDM', (SELECT id FROM departments WHERE code = 'FD'), 3500),
  ('Front Desk Agent', 'FDA', (SELECT id FROM departments WHERE code = 'FD'), 2000),
  ('Housekeeping Manager', 'HKM', (SELECT id FROM departments WHERE code = 'HK'), 3000),
  ('Room Attendant', 'RA', (SELECT id FROM departments WHERE code = 'HK'), 1500),
  ('Head Chef', 'HC', (SELECT id FROM departments WHERE code = 'KT'), 4000),
  ('Cook', 'CK', (SELECT id FROM departments WHERE code = 'KT'), 2500),
  ('Maintenance Supervisor', 'MS', (SELECT id FROM departments WHERE code = 'MT'), 3000),
  ('Maintenance Technician', 'MT', (SELECT id FROM departments WHERE code = 'MT'), 2000),
  ('Security Officer', 'SO', (SELECT id FROM departments WHERE code = 'SC'), 2000)
ON CONFLICT (code) DO NOTHING;

-- Create sales_data_clear table to track who cleared sales data
CREATE TABLE IF NOT EXISTS public.sales_data_clear_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleared_by UUID REFERENCES auth.users(id),
  cleared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_type TEXT NOT NULL,
  record_count INTEGER DEFAULT 0,
  notes TEXT
);

ALTER TABLE public.sales_data_clear_log ENABLE ROW LEVEL SECURITY;

-- Only admins can clear sales and view the log
CREATE POLICY "Only admins can view clear log"
  ON public.sales_data_clear_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can log clearing"
  ON public.sales_data_clear_log FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create function to clear sales data (admin only)
CREATE OR REPLACE FUNCTION public.clear_sales_data(data_type TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER := 0;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can clear sales data';
  END IF;

  -- Clear based on data type
  CASE data_type
    WHEN 'orders' THEN
      DELETE FROM public.orders;
      GET DIAGNOSTICS deleted_count = ROW_COUNT;
    WHEN 'bookings' THEN
      DELETE FROM public.room_bookings WHERE payment_status = 'paid';
      GET DIAGNOSTICS deleted_count = ROW_COUNT;
    WHEN 'all_sales' THEN
      DELETE FROM public.orders;
      DELETE FROM public.room_bookings WHERE payment_status = 'paid';
      GET DIAGNOSTICS deleted_count = ROW_COUNT;
    ELSE
      RAISE EXCEPTION 'Invalid data type: %', data_type;
  END CASE;

  -- Log the clearing action
  INSERT INTO public.sales_data_clear_log (cleared_by, data_type, record_count)
  VALUES (auth.uid(), data_type, deleted_count);

  result := json_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'data_type', data_type
  );

  RETURN result;
END;
$$;

-- Update trigger for positions
CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();