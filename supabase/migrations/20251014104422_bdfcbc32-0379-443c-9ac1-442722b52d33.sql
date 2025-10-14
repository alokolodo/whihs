-- =====================================================
-- COMPLETE DATABASE SETUP - ALL POLICIES INCLUDED
-- =====================================================

-- Step 1: Create enum type safely
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'staff', 'manager', 'front_desk', 'housekeeping', 'kitchen', 'bartender', 'procurement', 'hr', 'supervisor', 'maintenance', 'security', 'accounting');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Drop and recreate problematic tables
DROP TABLE IF EXISTS public.account_entries CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.financial_reports CASCADE;
DROP TABLE IF EXISTS public.account_categories CASCADE;
DROP TABLE IF EXISTS public.hotel_settings CASCADE;

-- Step 3: Create all core tables

-- Hotel Settings
CREATE TABLE public.hotel_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_name text NOT NULL DEFAULT 'My Hotel',
    hotel_address text,
    hotel_phone text,
    hotel_whatsapp text,
    hotel_email text,
    hotel_website text,
    hotel_description text,
    currency text NOT NULL DEFAULT 'USD',
    language text NOT NULL DEFAULT 'en',
    timezone text DEFAULT 'UTC',
    date_format text DEFAULT 'MM/dd/yyyy',
    time_format text DEFAULT '12h',
    tax_rate numeric DEFAULT 7.5,
    logo_url text,
    favicon_url text,
    site_title text DEFAULT 'Hotel Management System',
    hotel_icon text DEFAULT 'Hotel',
    primary_color text DEFAULT '222.2 84% 4.9%',
    accent_color text DEFAULT '346.8 77.2% 49.8%',
    background_color text DEFAULT '0 0% 100%',
    text_color text DEFAULT '222.2 84% 4.9%',
    card_color text DEFAULT '0 0% 100%',
    border_color text DEFAULT '214.3 31.8% 91.4%',
    notifications_enabled boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT false,
    desktop_notifications boolean DEFAULT true,
    dark_mode boolean DEFAULT false,
    payment_gateways jsonb DEFAULT '{"paypal": false, "stripe": true, "paystack": true, "razorpay": false, "flutterwave": true, "mobileMoney": true}'::jsonb,
    two_factor_enabled boolean DEFAULT false,
    session_timeout integer DEFAULT 30,
    hero_image_opacity numeric DEFAULT 0.7,
    hero_background_opacity numeric DEFAULT 0.9,
    advertisements jsonb DEFAULT '[]'::jsonb,
    loyalty_bronze_threshold numeric DEFAULT 0,
    loyalty_silver_threshold numeric DEFAULT 2000,
    loyalty_gold_threshold numeric DEFAULT 5000,
    loyalty_platinum_threshold numeric DEFAULT 10000,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Account Categories
CREATE TABLE public.account_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text NOT NULL,
    parent_id uuid REFERENCES public.account_categories(id),
    account_code text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Account Entries
CREATE TABLE public.account_entries (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_date date NOT NULL,
    category_id uuid REFERENCES public.account_categories(id),
    sub_category text,
    description text NOT NULL,
    amount numeric NOT NULL,
    debit_amount numeric DEFAULT 0,
    credit_amount numeric DEFAULT 0,
    payment_method text,
    reference_number text,
    status text NOT NULL DEFAULT 'pending',
    source_type text,
    source_id text,
    posted_by uuid REFERENCES auth.users(id),
    posted_at timestamp with time zone,
    created_by uuid REFERENCES auth.users(id),
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Financial Reports
CREATE TABLE public.financial_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_type text NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_income numeric DEFAULT 0,
    total_expenses numeric DEFAULT 0,
    net_profit numeric DEFAULT 0,
    report_data jsonb,
    generated_by uuid REFERENCES auth.users(id),
    generated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Budgets
CREATE TABLE public.budgets (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    fiscal_year integer NOT NULL,
    category_id uuid REFERENCES public.account_categories(id),
    period_type text NOT NULL DEFAULT 'monthly',
    period_number integer,
    budgeted_amount numeric NOT NULL,
    actual_amount numeric DEFAULT 0,
    variance numeric,
    variance_percentage numeric,
    status text NOT NULL DEFAULT 'active',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create all other tables if not exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    phone text,
    role text,
    department text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Step 4: Create ALL security definer functions

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_hotel_staff_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping', 'kitchen', 'procurement', 'bartender', 'supervisor', 'maintenance', 'security');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_management_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'supervisor');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_hr_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_financial_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'accounting', 'hr');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_kitchen_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'kitchen', 'staff');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_booking_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping');
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  assigned_role app_role;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  assigned_role := CASE WHEN user_count = 0 THEN 'admin'::app_role ELSE 'staff'::app_role END;
  
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'last_name');
  
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;

-- Step 5: Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_hotel_settings_updated_at ON public.hotel_settings;
CREATE TRIGGER update_hotel_settings_updated_at
  BEFORE UPDATE ON public.hotel_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_categories_updated_at ON public.account_categories;
CREATE TRIGGER update_account_categories_updated_at
  BEFORE UPDATE ON public.account_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_entries_updated_at ON public.account_entries;
CREATE TRIGGER update_account_entries_updated_at
  BEFORE UPDATE ON public.account_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 6: Enable RLS on ALL tables
ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop ALL existing policies
DROP POLICY IF EXISTS "hotel_settings_admin_modify" ON public.hotel_settings;
DROP POLICY IF EXISTS "hotel_settings_authenticated_select" ON public.hotel_settings;
DROP POLICY IF EXISTS "hotel_settings_admin_only_delete" ON public.hotel_settings;

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_view_own" ON public.profiles;

DROP POLICY IF EXISTS "Only financial staff can view account categories" ON public.account_categories;
DROP POLICY IF EXISTS "Only financial staff can insert account categories" ON public.account_categories;
DROP POLICY IF EXISTS "Only financial staff can update account categories" ON public.account_categories;
DROP POLICY IF EXISTS "Only admins can delete account categories" ON public.account_categories;

DROP POLICY IF EXISTS "Only financial staff can view account entries" ON public.account_entries;
DROP POLICY IF EXISTS "Only financial staff can insert account entries" ON public.account_entries;
DROP POLICY IF EXISTS "Only financial staff can update account entries" ON public.account_entries;
DROP POLICY IF EXISTS "Only admins can delete account entries" ON public.account_entries;

DROP POLICY IF EXISTS "Only financial staff can view financial reports" ON public.financial_reports;
DROP POLICY IF EXISTS "Only financial staff can insert financial reports" ON public.financial_reports;
DROP POLICY IF EXISTS "Only financial staff can update financial reports" ON public.financial_reports;
DROP POLICY IF EXISTS "Only admins can delete financial reports" ON public.financial_reports;

DROP POLICY IF EXISTS "Only financial staff can view budgets" ON public.budgets;
DROP POLICY IF EXISTS "Only financial staff can insert budgets" ON public.budgets;
DROP POLICY IF EXISTS "Only financial staff can update budgets" ON public.budgets;
DROP POLICY IF EXISTS "Only admins can delete budgets" ON public.budgets;

-- Step 8: Create ALL RLS policies

-- Hotel Settings Policies
CREATE POLICY "hotel_settings_admin_modify" ON public.hotel_settings
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "hotel_settings_authenticated_select" ON public.hotel_settings
FOR SELECT USING (true);

CREATE POLICY "hotel_settings_admin_only_delete" ON public.hotel_settings
FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- User Roles Policies
CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Profiles Policies
CREATE POLICY "profiles_admin_manage" ON public.profiles
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "profiles_user_view_own" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Account Categories Policies
CREATE POLICY "Only financial staff can view account categories" ON public.account_categories
FOR SELECT USING (has_financial_access());

CREATE POLICY "Only financial staff can insert account categories" ON public.account_categories
FOR INSERT WITH CHECK (has_financial_access());

CREATE POLICY "Only financial staff can update account categories" ON public.account_categories
FOR UPDATE USING (has_financial_access()) WITH CHECK (has_financial_access());

CREATE POLICY "Only admins can delete account categories" ON public.account_categories
FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Account Entries Policies
CREATE POLICY "Only financial staff can view account entries" ON public.account_entries
FOR SELECT USING (has_financial_access());

CREATE POLICY "Only financial staff can insert account entries" ON public.account_entries
FOR INSERT WITH CHECK (has_financial_access());

CREATE POLICY "Only financial staff can update account entries" ON public.account_entries
FOR UPDATE USING (has_financial_access()) WITH CHECK (has_financial_access());

CREATE POLICY "Only admins can delete account entries" ON public.account_entries
FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Financial Reports Policies
CREATE POLICY "Only financial staff can view financial reports" ON public.financial_reports
FOR SELECT USING (has_financial_access());

CREATE POLICY "Only financial staff can insert financial reports" ON public.financial_reports
FOR INSERT WITH CHECK (has_financial_access());

CREATE POLICY "Only financial staff can update financial reports" ON public.financial_reports
FOR UPDATE USING (has_financial_access()) WITH CHECK (has_financial_access());

CREATE POLICY "Only admins can delete financial reports" ON public.financial_reports
FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Budgets Policies
CREATE POLICY "Only financial staff can view budgets" ON public.budgets
FOR SELECT USING (has_financial_access());

CREATE POLICY "Only financial staff can insert budgets" ON public.budgets
FOR INSERT WITH CHECK (has_financial_access());

CREATE POLICY "Only financial staff can update budgets" ON public.budgets
FOR UPDATE USING (has_financial_access()) WITH CHECK (has_financial_access());

CREATE POLICY "Only admins can delete budgets" ON public.budgets
FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Step 9: Insert default data
INSERT INTO public.hotel_settings (hotel_name, currency, tax_rate)
VALUES ('My Hotel', 'USD', 7.5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.account_categories (name, type, account_code, description) VALUES
('Room Revenue', 'income', 'INC-001', 'Revenue from room bookings'),
('Food & Beverage', 'income', 'INC-002', 'Revenue from restaurant and bar'),
('Gym & Spa', 'income', 'INC-003', 'Revenue from gym and spa services'),
('Hall Bookings', 'income', 'INC-004', 'Revenue from event hall rentals'),
('Other Income', 'income', 'INC-999', 'Miscellaneous income'),
('Salaries', 'expense', 'EXP-001', 'Employee salaries and wages'),
('Utilities', 'expense', 'EXP-002', 'Electricity, water, internet'),
('Supplies', 'expense', 'EXP-003', 'Inventory and supplies'),
('Maintenance', 'expense', 'EXP-004', 'Repairs and maintenance'),
('Marketing', 'expense', 'EXP-005', 'Marketing and advertising'),
('Other Expenses', 'expense', 'EXP-999', 'Miscellaneous expenses')
ON CONFLICT DO NOTHING;