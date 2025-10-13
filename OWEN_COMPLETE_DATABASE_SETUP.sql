-- =====================================================
-- COMPLETE DATABASE SETUP FOR OWEN'S PROJECT
-- This file contains EVERYTHING from your database
-- Run this entire script once in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: CREATE ENUMS AND TYPES
-- =====================================================

-- Create app_role enum only if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'staff', 'manager', 'kitchen', 'front_desk', 'housekeeping', 'procurement', 'bartender', 'supervisor', 'maintenance', 'security', 'accounting', 'hr');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- PART 2: CREATE ALL TABLES
-- =====================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,
  phone text,
  role text,
  department text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Hotel settings table
CREATE TABLE IF NOT EXISTS public.hotel_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_name text NOT NULL DEFAULT 'My Hotel',
  hotel_address text,
  hotel_phone text,
  hotel_whatsapp text,
  hotel_email text,
  hotel_website text,
  hotel_description text,
  logo_url text,
  favicon_url text,
  site_title text DEFAULT 'Hotel Management System',
  hotel_icon text DEFAULT 'Hotel',
  currency text NOT NULL DEFAULT 'USD',
  language text NOT NULL DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  date_format text DEFAULT 'MM/dd/yyyy',
  time_format text DEFAULT '12h',
  tax_rate numeric DEFAULT 7.5,
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
  primary_color text DEFAULT '222.2 84% 4.9%',
  accent_color text DEFAULT '346.8 77.2% 49.8%',
  background_color text DEFAULT '0 0% 100%',
  text_color text DEFAULT '222.2 84% 4.9%',
  card_color text DEFAULT '0 0% 100%',
  border_color text DEFAULT '214.3 31.8% 91.4%',
  footer_content jsonb DEFAULT '{"email": "info@hotel.com", "phone": "+1234567890", "address": "123 Hotel Street, City, Country", "quick_links": [{"url": "/about", "text": "About Us"}, {"url": "/contact", "text": "Contact"}], "company_info": "Your Hotel - Luxury Accommodation", "social_links": {"twitter": "", "facebook": "", "instagram": ""}}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number text NOT NULL UNIQUE,
  room_type text NOT NULL,
  rate numeric NOT NULL,
  status text NOT NULL DEFAULT 'available',
  capacity integer NOT NULL DEFAULT 2,
  amenities text[] DEFAULT '{}',
  floor_number integer,
  description text,
  tax_rate numeric DEFAULT 7.5,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Room bookings table
CREATE TABLE IF NOT EXISTS public.room_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_phone text,
  guest_email text,
  check_in_date timestamp with time zone NOT NULL DEFAULT now(),
  check_out_date timestamp with time zone NOT NULL,
  nights integer NOT NULL,
  total_amount numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  booking_status text NOT NULL DEFAULT 'active',
  special_requests text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Guests table
CREATE TABLE IF NOT EXISTS public.guests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  address text,
  id_type text,
  id_number text,
  total_bookings integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  loyalty_tier text DEFAULT 'Bronze',
  status text DEFAULT 'active',
  last_stay date,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  cost_price numeric DEFAULT 0,
  category text NOT NULL,
  preparation_time integer DEFAULT 15,
  calories integer,
  is_popular boolean DEFAULT false,
  is_available boolean DEFAULT true,
  tracks_inventory boolean DEFAULT false,
  inventory_item_id uuid,
  recipe_id uuid,
  tax_rate numeric DEFAULT 7.5,
  allergens text[] DEFAULT '{}',
  ingredients text[] DEFAULT '{}',
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  instructions text,
  prep_time integer,
  cook_time integer,
  servings integer DEFAULT 1,
  cost numeric DEFAULT 0,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Recipe ingredients table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  inventory_item_id uuid,
  quantity_needed numeric NOT NULL,
  unit text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name text NOT NULL,
  category text NOT NULL,
  current_quantity integer NOT NULL DEFAULT 0,
  min_threshold integer NOT NULL DEFAULT 10,
  max_threshold integer NOT NULL DEFAULT 100,
  unit text NOT NULL DEFAULT 'units',
  cost_per_unit numeric NOT NULL DEFAULT 0,
  supplier text,
  last_restocked timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Inventory issuances table
CREATE TABLE IF NOT EXISTS public.inventory_issuances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id uuid NOT NULL,
  quantity_issued integer NOT NULL,
  issued_to text NOT NULL,
  issued_by uuid,
  department text,
  room_number text,
  purpose text NOT NULL,
  unit_cost numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'issued',
  notes text,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Restaurant tables
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number text NOT NULL UNIQUE,
  seats integer NOT NULL DEFAULT 4,
  status text NOT NULL DEFAULT 'available',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id uuid REFERENCES public.restaurant_tables(id),
  guest_name text NOT NULL,
  guest_type text NOT NULL,
  room_number text,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  payment_method text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_category text NOT NULL,
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  tax_rate numeric DEFAULT 7.5,
  special_instructions text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Kitchen orders table
CREATE TABLE IF NOT EXISTS public.kitchen_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  table_number text NOT NULL,
  guest_name text NOT NULL,
  items jsonb NOT NULL,
  status text NOT NULL DEFAULT 'received',
  priority integer NOT NULL DEFAULT 1,
  estimated_time integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Account categories table
CREATE TABLE IF NOT EXISTS public.account_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  parent_category_id uuid REFERENCES public.account_categories(id) ON DELETE SET NULL,
  account_code text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Account entries table
CREATE TABLE IF NOT EXISTS public.account_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  reference_number text,
  category_id uuid REFERENCES public.account_categories(id),
  sub_category text,
  amount numeric NOT NULL,
  debit_amount numeric DEFAULT 0,
  credit_amount numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  source_type text,
  source_id uuid,
  notes text,
  posted_by text,
  posted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  fiscal_year integer NOT NULL,
  category_id uuid REFERENCES public.account_categories(id) ON DELETE CASCADE,
  budgeted_amount numeric NOT NULL,
  actual_amount numeric DEFAULT 0,
  variance numeric,
  variance_percentage numeric,
  period_type text NOT NULL DEFAULT 'monthly',
  period_number integer,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  manager_id uuid,
  budget numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Employee positions table
CREATE TABLE IF NOT EXISTS public.employee_positions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  department_id uuid REFERENCES public.departments(id),
  min_salary numeric,
  max_salary numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  address text,
  department_id uuid REFERENCES public.departments(id),
  position_id uuid REFERENCES public.employee_positions(id),
  hire_date date NOT NULL DEFAULT CURRENT_DATE,
  salary numeric NOT NULL,
  employment_type text NOT NULL DEFAULT 'full-time',
  status text NOT NULL DEFAULT 'active',
  date_of_birth date,
  national_id text,
  bank_account text,
  emergency_contact_name text,
  emergency_contact_phone text,
  total_leave_days integer DEFAULT 25,
  used_leave_days integer DEFAULT 0,
  manager_id uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  leave_type text NOT NULL,
  reason text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamp with time zone,
  rejection_reason text,
  applied_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Employee loans table
CREATE TABLE IF NOT EXISTS public.employee_loans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  loan_amount numeric NOT NULL,
  monthly_deduction numeric NOT NULL,
  remaining_amount numeric NOT NULL,
  purpose text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_end_date date,
  approved_by uuid,
  approved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Payroll records table
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  pay_period_start date NOT NULL,
  pay_period_end date NOT NULL,
  base_salary numeric NOT NULL,
  overtime_hours numeric DEFAULT 0,
  overtime_rate numeric DEFAULT 0,
  bonus numeric DEFAULT 0,
  loan_deduction numeric DEFAULT 0,
  tax_deduction numeric DEFAULT 0,
  other_deductions numeric DEFAULT 0,
  gross_pay numeric NOT NULL,
  net_pay numeric NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  processed_at timestamp with time zone,
  processed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Performance reviews table
CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  review_period_start date NOT NULL,
  review_period_end date NOT NULL,
  overall_rating numeric,
  goals_achievement numeric,
  teamwork numeric,
  communication numeric,
  leadership numeric,
  strengths text,
  areas_for_improvement text,
  goals_next_period text,
  comments text,
  status text NOT NULL DEFAULT 'draft',
  due_date date,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Staff recognition table
CREATE TABLE IF NOT EXISTS public.staff_recognition (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  recognition_type text NOT NULL,
  title text NOT NULL,
  description text,
  month_year date,
  nominated_by uuid,
  votes integer DEFAULT 0,
  total_votes integer DEFAULT 0,
  voting_period text,
  award_date date DEFAULT CURRENT_DATE,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Staff votes table
CREATE TABLE IF NOT EXISTS public.staff_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL,
  voter_name text NOT NULL,
  voter_type text NOT NULL,
  voting_period text NOT NULL,
  voted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Employee access log table
CREATE TABLE IF NOT EXISTS public.employee_access_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid,
  accessed_by uuid,
  access_type text NOT NULL,
  accessed_fields text[],
  user_agent text,
  ip_address inet,
  access_time timestamp with time zone DEFAULT now()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  category text NOT NULL,
  payment_terms text DEFAULT 'Net 30',
  tax_id text,
  status text NOT NULL DEFAULT 'active',
  rating numeric DEFAULT 0.0,
  total_orders integer DEFAULT 0,
  total_amount numeric DEFAULT 0.00,
  last_order_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Supplier orders table
CREATE TABLE IF NOT EXISTS public.supplier_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date date,
  delivery_date date,
  total_amount numeric NOT NULL DEFAULT 0.00,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Supplier order items table
CREATE TABLE IF NOT EXISTS public.supplier_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.supplier_orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  received_quantity integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Supplier payments table
CREATE TABLE IF NOT EXISTS public.supplier_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  order_id uuid REFERENCES public.supplier_orders(id),
  amount numeric NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL,
  reference_number text,
  status text NOT NULL DEFAULT 'completed',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Halls table
CREATE TABLE IF NOT EXISTS public.halls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL,
  capacity integer NOT NULL,
  hourly_rate numeric NOT NULL,
  amenities text[] DEFAULT '{}',
  availability text DEFAULT 'available',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Hall bookings table
CREATE TABLE IF NOT EXISTS public.hall_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hall_id uuid NOT NULL REFERENCES public.halls(id),
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  event_type text NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  hours numeric NOT NULL,
  total_amount numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  booking_status text NOT NULL DEFAULT 'active',
  special_requests text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Game stations table
CREATE TABLE IF NOT EXISTS public.game_stations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_name text NOT NULL,
  station_type text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  hourly_rate numeric NOT NULL,
  location text,
  equipment_details text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id uuid NOT NULL REFERENCES public.game_stations(id),
  player_name text NOT NULL,
  player_phone text,
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  end_time timestamp with time zone,
  duration_hours numeric,
  hourly_rate numeric NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_method text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Game tournaments table
CREATE TABLE IF NOT EXISTS public.game_tournaments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  game_type text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  entry_fee numeric DEFAULT 0,
  prize_pool numeric DEFAULT 0,
  max_participants integer,
  current_participants integer DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming',
  rules text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Game bookings table
CREATE TABLE IF NOT EXISTS public.game_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid REFERENCES public.game_tournaments(id),
  station_id uuid REFERENCES public.game_stations(id),
  player_name text NOT NULL,
  player_email text,
  player_phone text,
  booking_date timestamp with time zone NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Gym members table
CREATE TABLE IF NOT EXISTS public.gym_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id text NOT NULL UNIQUE,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  membership_type text NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  emergency_contact text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Gym member checkins table
CREATE TABLE IF NOT EXISTS public.gym_member_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES public.gym_members(id),
  check_in_time timestamp with time zone NOT NULL DEFAULT now(),
  check_out_time timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Gym trainers table
CREATE TABLE IF NOT EXISTS public.gym_trainers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  specialization text NOT NULL,
  phone text NOT NULL,
  email text,
  hourly_rate numeric NOT NULL,
  status text NOT NULL DEFAULT 'available',
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Gym trainer bookings table
CREATE TABLE IF NOT EXISTS public.gym_trainer_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid NOT NULL REFERENCES public.gym_trainers(id),
  member_id uuid NOT NULL REFERENCES public.gym_members(id),
  session_date timestamp with time zone NOT NULL,
  duration integer NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Gym equipment table
CREATE TABLE IF NOT EXISTS public.gym_equipment (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  serial_number text,
  status text DEFAULT 'available',
  location text,
  purchase_date date,
  warranty_expiration date,
  last_maintenance date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Housekeeping tasks table
CREATE TABLE IF NOT EXISTS public.housekeeping_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid REFERENCES public.rooms(id),
  task_type text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  description text,
  assigned_to uuid,
  due_date timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  estimated_duration integer,
  actual_duration integer,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Content pages table
CREATE TABLE IF NOT EXISTS public.content_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug text NOT NULL,
  page_title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  footer_content jsonb DEFAULT '{"email": "info@hotel.com", "phone": "+1234567890", "address": "123 Hotel Street, City, Country", "quick_links": [{"url": "/about", "text": "About Us"}, {"url": "/contact", "text": "Contact"}], "company_info": "Your Hotel - Luxury Accommodation", "social_links": {"twitter": "", "facebook": "", "instagram": ""}}'::jsonb,
  is_published boolean DEFAULT true,
  created_by uuid,
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Financial reports table
CREATE TABLE IF NOT EXISTS public.financial_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type text NOT NULL,
  report_date date NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  data jsonb NOT NULL,
  generated_by uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- =====================================================
-- PART 3: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_account_entries_entry_date ON public.account_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_account_entries_category_id ON public.account_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_fiscal_year ON public.budgets(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_room_bookings_room_id ON public.room_bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_type ON public.orders(guest_type);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- =====================================================
-- PART 4: CREATE FUNCTIONS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Has financial access function
CREATE OR REPLACE FUNCTION public.has_financial_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'accounting', 'hr');
END;
$function$;

-- Has HR access function
CREATE OR REPLACE FUNCTION public.has_hr_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager');
END;
$function$;

-- Has hotel staff access function
CREATE OR REPLACE FUNCTION public.has_hotel_staff_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping', 'kitchen', 'procurement', 'bartender', 'supervisor', 'maintenance', 'security');
END;
$function$;

-- Has management access function
CREATE OR REPLACE FUNCTION public.has_management_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'supervisor');
END;
$function$;

-- Has kitchen access function
CREATE OR REPLACE FUNCTION public.has_kitchen_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) 
         IN ('admin', 'manager', 'kitchen', 'staff');
END;
$function$;

-- Has booking access function
CREATE OR REPLACE FUNCTION public.has_booking_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping');
END;
$function$;

-- Has role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

-- Get user role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id LIMIT 1;
  RETURN user_role;
END;
$function$;

-- Get current user role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- Can access employee data function
CREATE OR REPLACE FUNCTION public.can_access_employee_data(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_email text;
  emp_email text;
BEGIN
  IF public.has_hr_access() THEN
    RETURN TRUE;
  END IF;
  
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  SELECT email INTO emp_email FROM public.employees WHERE id = emp_id;
  
  RETURN (current_user_email = emp_email);
END;
$function$;

-- Can access employee basic info only function
CREATE OR REPLACE FUNCTION public.can_access_employee_basic_info_only(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_role text;
  current_user_email text;
  current_user_dept_id uuid;
  emp_email text;
  emp_dept_id uuid;
BEGIN
  SELECT p.role, u.email, e.department_id 
  INTO current_user_role, current_user_email, current_user_dept_id
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.employees e ON e.email = u.email
  WHERE p.id = auth.uid();
  
  IF current_user_role IN ('admin', 'hr') THEN
    RETURN TRUE;
  END IF;
  
  SELECT email, department_id INTO emp_email, emp_dept_id 
  FROM public.employees WHERE id = emp_id;
  
  IF emp_email = current_user_email THEN
    RETURN TRUE;
  END IF;
  
  IF current_user_role = 'manager' AND current_user_dept_id IS NOT NULL 
     AND emp_dept_id = current_user_dept_id THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;

-- Calculate recipe cost function
CREATE OR REPLACE FUNCTION public.calculate_recipe_cost(recipe_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_cost NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(ri.quantity_needed * i.cost_per_unit), 0)
  INTO total_cost
  FROM recipe_ingredients ri
  JOIN inventory i ON i.id = ri.inventory_item_id
  WHERE ri.recipe_id = recipe_uuid;
  
  RETURN total_cost;
END;
$function$;

-- Deduct recipe ingredients function
CREATE OR REPLACE FUNCTION public.deduct_recipe_ingredients(menu_item_uuid uuid, quantity_sold integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recipe_uuid UUID;
  ingredient_record RECORD;
BEGIN
  SELECT recipe_id INTO recipe_uuid
  FROM menu_items
  WHERE id = menu_item_uuid;
  
  IF recipe_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  FOR ingredient_record IN 
    SELECT inventory_item_id, quantity_needed
    FROM recipe_ingredients
    WHERE recipe_id = recipe_uuid
  LOOP
    UPDATE inventory
    SET 
      current_quantity = GREATEST(0, current_quantity - (ingredient_record.quantity_needed * quantity_sold)),
      updated_at = now()
    WHERE id = ingredient_record.inventory_item_id;
  END LOOP;
  
  RETURN TRUE;
END;
$function$;

-- Update recipe cost trigger function
CREATE OR REPLACE FUNCTION public.update_recipe_cost_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_cost NUMERIC;
BEGIN
  new_cost := calculate_recipe_cost(COALESCE(NEW.recipe_id, OLD.recipe_id));
  
  UPDATE recipes
  SET cost = new_cost, updated_at = now()
  WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  
  UPDATE menu_items
  SET cost_price = new_cost, updated_at = now()
  WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create menu item for drink function
CREATE OR REPLACE FUNCTION public.create_menu_item_for_drink()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF LOWER(NEW.category) IN ('soft drinks', 'alcoholic beverages', 'spirits', 'hot beverages', 'beer', 'wine', 'liquor', 'juice', 'water', 'energy drinks', 'cocktails', 'drinks', 'beverages') THEN
    INSERT INTO public.menu_items (
      name,
      category,
      description,
      price,
      cost_price,
      tracks_inventory,
      inventory_item_id,
      is_available
    ) VALUES (
      NEW.item_name,
      NEW.category,
      'Drink item from inventory',
      0,
      NEW.cost_per_unit,
      true,
      NEW.id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update menu item cost function
CREATE OR REPLACE FUNCTION public.update_menu_item_cost()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.cost_per_unit != OLD.cost_per_unit THEN
    UPDATE public.menu_items
    SET cost_price = NEW.cost_per_unit,
        updated_at = now()
    WHERE inventory_item_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update order total function
CREATE OR REPLACE FUNCTION public.update_order_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    UPDATE public.supplier_orders 
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM public.supplier_order_items 
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update supplier stats function
CREATE OR REPLACE FUNCTION public.update_supplier_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
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
$function$;

-- Update room status after booking function
CREATE OR REPLACE FUNCTION public.update_room_status_after_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    IF NEW.booking_status = 'active' AND NEW.payment_status = 'paid' THEN
        UPDATE public.rooms 
        SET status = 'occupied', updated_at = now()
        WHERE id = NEW.room_id;
    END IF;
    
    IF NEW.booking_status = 'completed' OR NEW.booking_status = 'cancelled' THEN
        UPDATE public.rooms 
        SET status = 'available', updated_at = now()
        WHERE id = NEW.room_id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Handle new user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count INTEGER;
  assigned_role app_role;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  assigned_role := CASE WHEN user_count = 0 THEN 'admin'::app_role ELSE 'staff'::app_role END;
  
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$function$;

-- Handle booking guest function
CREATE OR REPLACE FUNCTION public.handle_booking_guest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_guest_id uuid;
  v_new_total numeric;
  v_bronze_threshold numeric;
  v_silver_threshold numeric;
  v_gold_threshold numeric;
  v_platinum_threshold numeric;
BEGIN
  SELECT 
    loyalty_bronze_threshold,
    loyalty_silver_threshold,
    loyalty_gold_threshold,
    loyalty_platinum_threshold
  INTO 
    v_bronze_threshold,
    v_silver_threshold,
    v_gold_threshold,
    v_platinum_threshold
  FROM public.hotel_settings
  LIMIT 1;
  
  v_bronze_threshold := COALESCE(v_bronze_threshold, 0);
  v_silver_threshold := COALESCE(v_silver_threshold, 2000);
  v_gold_threshold := COALESCE(v_gold_threshold, 5000);
  v_platinum_threshold := COALESCE(v_platinum_threshold, 10000);
  
  SELECT id INTO v_guest_id
  FROM public.guests
  WHERE email = NEW.guest_email;
  
  IF v_guest_id IS NULL THEN
    INSERT INTO public.guests (
      name,
      email,
      phone,
      total_bookings,
      total_spent,
      loyalty_tier,
      status,
      last_stay
    ) VALUES (
      NEW.guest_name,
      NEW.guest_email,
      NEW.guest_phone,
      1,
      NEW.total_amount,
      CASE
        WHEN NEW.total_amount >= v_platinum_threshold THEN 'Platinum'
        WHEN NEW.total_amount >= v_gold_threshold THEN 'Gold'
        WHEN NEW.total_amount >= v_silver_threshold THEN 'Silver'
        ELSE 'Bronze'
      END,
      'active',
      NEW.check_in_date
    );
  ELSE
    SELECT total_spent + NEW.total_amount INTO v_new_total
    FROM public.guests WHERE id = v_guest_id;
    
    UPDATE public.guests
    SET 
      total_bookings = total_bookings + 1,
      total_spent = v_new_total,
      last_stay = NEW.check_in_date,
      loyalty_tier = CASE
        WHEN v_new_total >= v_platinum_threshold THEN 'Platinum'
        WHEN v_new_total >= v_gold_threshold THEN 'Gold'
        WHEN v_new_total >= v_silver_threshold THEN 'Silver'
        ELSE 'Bronze'
      END
    WHERE id = v_guest_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Prevent multiple hotel settings function
CREATE OR REPLACE FUNCTION public.prevent_multiple_hotel_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF (SELECT COUNT(*) FROM hotel_settings) >= 1 THEN
    RAISE EXCEPTION 'Only one hotel_settings row is allowed';
  END IF;
  RETURN NEW;
END;
$function$;

-- =====================================================
-- PART 5: CREATE TRIGGERS
-- =====================================================

-- Updated at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_room_bookings_updated_at ON public.room_bookings;
CREATE TRIGGER update_room_bookings_updated_at
  BEFORE UPDATE ON public.room_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_ingredients_updated_at ON public.recipe_ingredients;
CREATE TRIGGER update_recipe_ingredients_updated_at
  BEFORE UPDATE ON public.recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_restaurant_tables_updated_at ON public.restaurant_tables;
CREATE TRIGGER update_restaurant_tables_updated_at
  BEFORE UPDATE ON public.restaurant_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_items_updated_at ON public.order_items;
CREATE TRIGGER update_order_items_updated_at
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_kitchen_orders_updated_at ON public.kitchen_orders;
CREATE TRIGGER update_kitchen_orders_updated_at
  BEFORE UPDATE ON public.kitchen_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_categories_updated_at ON public.account_categories;
CREATE TRIGGER update_account_categories_updated_at
  BEFORE UPDATE ON public.account_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_entries_updated_at ON public.account_entries;
CREATE TRIGGER update_account_entries_updated_at
  BEFORE UPDATE ON public.account_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON public.leave_requests;
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_employee_loans_updated_at ON public.employee_loans;
CREATE TRIGGER update_employee_loans_updated_at
  BEFORE UPDATE ON public.employee_loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_supplier_orders_updated_at ON public.supplier_orders;
CREATE TRIGGER update_supplier_orders_updated_at
  BEFORE UPDATE ON public.supplier_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Business logic triggers
DROP TRIGGER IF EXISTS create_menu_item_for_drink_trigger ON public.inventory;
CREATE TRIGGER create_menu_item_for_drink_trigger
  AFTER INSERT ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.create_menu_item_for_drink();

DROP TRIGGER IF EXISTS update_menu_item_cost_trigger ON public.inventory;
CREATE TRIGGER update_menu_item_cost_trigger
  AFTER UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_menu_item_cost();

DROP TRIGGER IF EXISTS update_recipe_cost_on_ingredient_change ON public.recipe_ingredients;
CREATE TRIGGER update_recipe_cost_on_ingredient_change
  AFTER INSERT OR UPDATE OR DELETE ON public.recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_recipe_cost_trigger();

DROP TRIGGER IF EXISTS update_supplier_order_total ON public.supplier_order_items;
CREATE TRIGGER update_supplier_order_total
  AFTER INSERT OR UPDATE OR DELETE ON public.supplier_order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_total();

DROP TRIGGER IF EXISTS update_supplier_stats_trigger ON public.supplier_orders;
CREATE TRIGGER update_supplier_stats_trigger
  AFTER INSERT OR UPDATE ON public.supplier_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supplier_stats();

DROP TRIGGER IF EXISTS update_room_status_on_booking ON public.room_bookings;
CREATE TRIGGER update_room_status_on_booking
  AFTER INSERT OR UPDATE ON public.room_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_room_status_after_booking();

DROP TRIGGER IF EXISTS handle_booking_guest_trigger ON public.room_bookings;
CREATE TRIGGER handle_booking_guest_trigger
  AFTER INSERT ON public.room_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_booking_guest();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS prevent_multiple_settings ON public.hotel_settings;
CREATE TRIGGER prevent_multiple_settings
  BEFORE INSERT ON public.hotel_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_multiple_hotel_settings();

-- =====================================================
-- PART 6: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_member_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_trainer_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 7: CREATE RLS POLICIES
-- =====================================================

-- ... keep existing code (RLS policies continue)

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- User roles policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Hotel settings policies
DROP POLICY IF EXISTS "hotel_settings_admin_modify" ON public.hotel_settings;
CREATE POLICY "hotel_settings_admin_modify"
ON public.hotel_settings FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "hotel_settings_authenticated_select" ON public.hotel_settings;
CREATE POLICY "hotel_settings_authenticated_select"
ON public.hotel_settings FOR SELECT
TO authenticated
USING (true);

-- Rooms policies
DROP POLICY IF EXISTS "Staff can view rooms" ON public.rooms;
CREATE POLICY "Staff can view rooms"
ON public.rooms FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage rooms" ON public.rooms;
CREATE POLICY "Management can manage rooms"
ON public.rooms FOR ALL
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Room bookings policies
DROP POLICY IF EXISTS "secure_bookings_select" ON public.room_bookings;
CREATE POLICY "secure_bookings_select"
ON public.room_bookings FOR SELECT
TO authenticated
USING (has_booking_access());

DROP POLICY IF EXISTS "secure_bookings_insert" ON public.room_bookings;
CREATE POLICY "secure_bookings_insert"
ON public.room_bookings FOR INSERT
TO authenticated
WITH CHECK (has_booking_access());

DROP POLICY IF EXISTS "secure_bookings_update" ON public.room_bookings;
CREATE POLICY "secure_bookings_update"
ON public.room_bookings FOR UPDATE
TO authenticated
USING (has_booking_access())
WITH CHECK (has_booking_access());

DROP POLICY IF EXISTS "secure_bookings_delete" ON public.room_bookings;
CREATE POLICY "secure_bookings_delete"
ON public.room_bookings FOR DELETE
TO authenticated
USING (has_management_access());

-- Guests policies
DROP POLICY IF EXISTS "Staff can view guests" ON public.guests;
CREATE POLICY "Staff can view guests"
ON public.guests FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Staff can manage guests" ON public.guests;
CREATE POLICY "Staff can manage guests"
ON public.guests FOR ALL
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

-- Menu items policies
DROP POLICY IF EXISTS "Authenticated users can view menu items" ON public.menu_items;
CREATE POLICY "Authenticated users can view menu items"
ON public.menu_items FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Staff can manage menu items" ON public.menu_items;
CREATE POLICY "Staff can manage menu items"
ON public.menu_items FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'staff', 'kitchen'))
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'staff', 'kitchen'));

-- Recipes policies
DROP POLICY IF EXISTS "Staff can view recipes" ON public.recipes;
CREATE POLICY "Staff can view recipes"
ON public.recipes FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Kitchen and management can manage recipes" ON public.recipes;
CREATE POLICY "Kitchen and management can manage recipes"
ON public.recipes FOR ALL
TO authenticated
USING (has_kitchen_access() OR has_management_access())
WITH CHECK (has_kitchen_access() OR has_management_access());

-- Recipe ingredients policies
DROP POLICY IF EXISTS "Staff can view recipe ingredients" ON public.recipe_ingredients;
CREATE POLICY "Staff can view recipe ingredients"
ON public.recipe_ingredients FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Kitchen and management can manage recipe ingredients" ON public.recipe_ingredients;
CREATE POLICY "Kitchen and management can manage recipe ingredients"
ON public.recipe_ingredients FOR ALL
TO authenticated
USING (has_kitchen_access() OR has_management_access())
WITH CHECK (has_kitchen_access() OR has_management_access());

-- Inventory policies
DROP POLICY IF EXISTS "inventory_staff_access_select" ON public.inventory;
CREATE POLICY "inventory_staff_access_select"
ON public.inventory FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "inventory_management_insert" ON public.inventory;
CREATE POLICY "inventory_management_insert"
ON public.inventory FOR INSERT
TO authenticated
WITH CHECK (has_management_access() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'procurement');

DROP POLICY IF EXISTS "inventory_management_update" ON public.inventory;
CREATE POLICY "inventory_management_update"
ON public.inventory FOR UPDATE
TO authenticated
USING (has_management_access() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'procurement')
WITH CHECK (has_management_access() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'procurement');

DROP POLICY IF EXISTS "inventory_admin_delete" ON public.inventory;
CREATE POLICY "inventory_admin_delete"
ON public.inventory FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Inventory issuances policies
DROP POLICY IF EXISTS "Staff can view inventory issuances" ON public.inventory_issuances;
CREATE POLICY "Staff can view inventory issuances"
ON public.inventory_issuances FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Staff can create inventory issuances" ON public.inventory_issuances;
CREATE POLICY "Staff can create inventory issuances"
ON public.inventory_issuances FOR INSERT
TO authenticated
WITH CHECK (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can update inventory issuances" ON public.inventory_issuances;
CREATE POLICY "Management can update inventory issuances"
ON public.inventory_issuances FOR UPDATE
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Restaurant tables policies
DROP POLICY IF EXISTS "restaurant_tables_staff_access_select" ON public.restaurant_tables;
CREATE POLICY "restaurant_tables_staff_access_select"
ON public.restaurant_tables FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "restaurant_tables_management_modify" ON public.restaurant_tables;
CREATE POLICY "restaurant_tables_management_modify"
ON public.restaurant_tables FOR INSERT
TO authenticated
WITH CHECK (has_management_access());

DROP POLICY IF EXISTS "restaurant_tables_management_update" ON public.restaurant_tables;
CREATE POLICY "restaurant_tables_management_update"
ON public.restaurant_tables FOR UPDATE
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

DROP POLICY IF EXISTS "restaurant_tables_management_delete" ON public.restaurant_tables;
CREATE POLICY "restaurant_tables_management_delete"
ON public.restaurant_tables FOR DELETE
TO authenticated
USING (has_management_access());

-- Orders policies
DROP POLICY IF EXISTS "secure_orders_select" ON public.orders;
CREATE POLICY "secure_orders_select"
ON public.orders FOR SELECT
TO authenticated
USING (has_booking_access());

DROP POLICY IF EXISTS "secure_orders_insert" ON public.orders;
CREATE POLICY "secure_orders_insert"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (has_booking_access());

DROP POLICY IF EXISTS "secure_orders_update" ON public.orders;
CREATE POLICY "secure_orders_update"
ON public.orders FOR UPDATE
TO authenticated
USING (has_booking_access())
WITH CHECK (has_booking_access());

DROP POLICY IF EXISTS "secure_orders_delete" ON public.orders;
CREATE POLICY "secure_orders_delete"
ON public.orders FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Order items policies
DROP POLICY IF EXISTS "order_items_staff_access_select" ON public.order_items;
CREATE POLICY "order_items_staff_access_select"
ON public.order_items FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "order_items_staff_access_insert" ON public.order_items;
CREATE POLICY "order_items_staff_access_insert"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (has_hotel_staff_access());

DROP POLICY IF EXISTS "order_items_staff_access_update" ON public.order_items;
CREATE POLICY "order_items_staff_access_update"
ON public.order_items FOR UPDATE
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

DROP POLICY IF EXISTS "order_items_management_delete" ON public.order_items;
CREATE POLICY "order_items_management_delete"
ON public.order_items FOR DELETE
TO authenticated
USING (has_management_access());

-- Kitchen orders policies
DROP POLICY IF EXISTS "kitchen_orders_kitchen_access_select" ON public.kitchen_orders;
CREATE POLICY "kitchen_orders_kitchen_access_select"
ON public.kitchen_orders FOR SELECT
TO authenticated
USING (has_kitchen_access());

DROP POLICY IF EXISTS "kitchen_orders_kitchen_access_insert" ON public.kitchen_orders;
CREATE POLICY "kitchen_orders_kitchen_access_insert"
ON public.kitchen_orders FOR INSERT
TO authenticated
WITH CHECK (has_kitchen_access());

DROP POLICY IF EXISTS "kitchen_orders_kitchen_access_update" ON public.kitchen_orders;
CREATE POLICY "kitchen_orders_kitchen_access_update"
ON public.kitchen_orders FOR UPDATE
TO authenticated
USING (has_kitchen_access())
WITH CHECK (has_kitchen_access());

DROP POLICY IF EXISTS "kitchen_orders_management_delete" ON public.kitchen_orders;
CREATE POLICY "kitchen_orders_management_delete"
ON public.kitchen_orders FOR DELETE
TO authenticated
USING (has_management_access());

-- Account categories policies
DROP POLICY IF EXISTS "Only financial staff can view account categories" ON public.account_categories;
CREATE POLICY "Only financial staff can view account categories"
ON public.account_categories FOR SELECT
TO authenticated
USING (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can insert account categories" ON public.account_categories;
CREATE POLICY "Only financial staff can insert account categories"
ON public.account_categories FOR INSERT
TO authenticated
WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can update account categories" ON public.account_categories;
CREATE POLICY "Only financial staff can update account categories"
ON public.account_categories FOR UPDATE
TO authenticated
USING (has_financial_access())
WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only admins can delete account categories" ON public.account_categories;
CREATE POLICY "Only admins can delete account categories"
ON public.account_categories FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Account entries policies
DROP POLICY IF EXISTS "Only financial staff can view account entries" ON public.account_entries;
CREATE POLICY "Only financial staff can view account entries"
ON public.account_entries FOR SELECT
TO authenticated
USING (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can insert account entries" ON public.account_entries;
CREATE POLICY "Only financial staff can insert account entries"
ON public.account_entries FOR INSERT
TO authenticated
WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can update account entries" ON public.account_entries;
CREATE POLICY "Only financial staff can update account entries"
ON public.account_entries FOR UPDATE
TO authenticated
USING (has_financial_access())
WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only admins can delete account entries" ON public.account_entries;
CREATE POLICY "Only admins can delete account entries"
ON public.account_entries FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Budgets policies
DROP POLICY IF EXISTS "Only financial staff can view budgets" ON public.budgets;
CREATE POLICY "Only financial staff can view budgets"
ON public.budgets FOR SELECT
TO authenticated
USING (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can insert budgets" ON public.budgets;
CREATE POLICY "Only financial staff can insert budgets"
ON public.budgets FOR INSERT
TO authenticated
WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can update budgets" ON public.budgets;
CREATE POLICY "Only financial staff can update budgets"
ON public.budgets FOR UPDATE
TO authenticated
USING (has_financial_access())
WITH CHECK (has_financial_access());

DROP POLICY IF EXISTS "Only admins can delete budgets" ON public.budgets;
CREATE POLICY "Only admins can delete budgets"
ON public.budgets FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Departments policies
DROP POLICY IF EXISTS "departments_hr_management_select" ON public.departments;
CREATE POLICY "departments_hr_management_select"
ON public.departments FOR SELECT
TO authenticated
USING (has_hr_access());

DROP POLICY IF EXISTS "departments_admin_modify" ON public.departments;
CREATE POLICY "departments_admin_modify"
ON public.departments FOR INSERT
TO authenticated
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "departments_admin_update" ON public.departments;
CREATE POLICY "departments_admin_update"
ON public.departments FOR UPDATE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "departments_admin_delete" ON public.departments;
CREATE POLICY "departments_admin_delete"
ON public.departments FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Employee positions policies
DROP POLICY IF EXISTS "HR can view positions" ON public.employee_positions;
CREATE POLICY "HR can view positions"
ON public.employee_positions FOR SELECT
TO authenticated
USING (has_hr_access());

DROP POLICY IF EXISTS "Admin can manage positions" ON public.employee_positions;
CREATE POLICY "Admin can manage positions"
ON public.employee_positions FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Employees policies
DROP POLICY IF EXISTS "employees_secure_select_with_field_protection" ON public.employees;
CREATE POLICY "employees_secure_select_with_field_protection"
ON public.employees FOR SELECT
TO authenticated
USING (can_access_employee_basic_info_only(id));

DROP POLICY IF EXISTS "employees_insert_hr_only" ON public.employees;
CREATE POLICY "employees_insert_hr_only"
ON public.employees FOR INSERT
TO authenticated
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager'));

DROP POLICY IF EXISTS "employees_secure_update_with_field_restrictions" ON public.employees;
CREATE POLICY "employees_secure_update_with_field_restrictions"
ON public.employees FOR UPDATE
TO authenticated
USING (
  ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager')) OR 
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
)
WITH CHECK (
  ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager')) OR 
  (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

DROP POLICY IF EXISTS "employees_delete_admin_only" ON public.employees;
CREATE POLICY "employees_delete_admin_only"
ON public.employees FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Leave requests policies
DROP POLICY IF EXISTS "secure_leave_select" ON public.leave_requests;
CREATE POLICY "secure_leave_select"
ON public.leave_requests FOR SELECT
TO authenticated
USING (can_access_employee_data(employee_id));

DROP POLICY IF EXISTS "secure_leave_insert" ON public.leave_requests;
CREATE POLICY "secure_leave_insert"
ON public.leave_requests FOR INSERT
TO authenticated
WITH CHECK (
  (employee_id IN (SELECT id FROM employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))) 
  OR has_hr_access()
);

DROP POLICY IF EXISTS "secure_leave_update" ON public.leave_requests;
CREATE POLICY "secure_leave_update"
ON public.leave_requests FOR UPDATE
TO authenticated
USING (has_hr_access())
WITH CHECK (has_hr_access());

DROP POLICY IF EXISTS "secure_leave_delete" ON public.leave_requests;
CREATE POLICY "secure_leave_delete"
ON public.leave_requests FOR DELETE
TO authenticated
USING (has_hr_access());

-- Employee loans policies  
DROP POLICY IF EXISTS "secure_loan_select" ON public.employee_loans;
CREATE POLICY "secure_loan_select"
ON public.employee_loans FOR SELECT
TO authenticated
USING (can_access_employee_data(employee_id));

DROP POLICY IF EXISTS "secure_loan_insert" ON public.employee_loans;
CREATE POLICY "secure_loan_insert"
ON public.employee_loans FOR INSERT
TO authenticated
WITH CHECK (
  (employee_id IN (SELECT id FROM employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))) 
  OR has_hr_access()
);

DROP POLICY IF EXISTS "secure_loan_update" ON public.employee_loans;
CREATE POLICY "secure_loan_update"
ON public.employee_loans FOR UPDATE
TO authenticated
USING (has_hr_access())
WITH CHECK (has_hr_access());

DROP POLICY IF EXISTS "secure_loan_delete" ON public.employee_loans;
CREATE POLICY "secure_loan_delete"
ON public.employee_loans FOR DELETE
TO authenticated
USING (has_hr_access());

-- Payroll records policies
DROP POLICY IF EXISTS "secure_payroll_select" ON public.payroll_records;
CREATE POLICY "secure_payroll_select"
ON public.payroll_records FOR SELECT
TO authenticated
USING (can_access_employee_data(employee_id));

DROP POLICY IF EXISTS "secure_payroll_insert" ON public.payroll_records;
CREATE POLICY "secure_payroll_insert"
ON public.payroll_records FOR INSERT
TO authenticated
WITH CHECK (has_hr_access());

DROP POLICY IF EXISTS "secure_payroll_update" ON public.payroll_records;
CREATE POLICY "secure_payroll_update"
ON public.payroll_records FOR UPDATE
TO authenticated
USING (has_hr_access())
WITH CHECK (has_hr_access());

DROP POLICY IF EXISTS "secure_payroll_delete" ON public.payroll_records;
CREATE POLICY "secure_payroll_delete"
ON public.payroll_records FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Performance reviews policies
DROP POLICY IF EXISTS "secure_review_select" ON public.performance_reviews;
CREATE POLICY "secure_review_select"
ON public.performance_reviews FOR SELECT
TO authenticated
USING (
  has_hr_access() OR 
  (employee_id IN (SELECT id FROM employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))) OR 
  (reviewer_id = auth.uid())
);

DROP POLICY IF EXISTS "secure_review_insert" ON public.performance_reviews;
CREATE POLICY "secure_review_insert"
ON public.performance_reviews FOR INSERT
TO authenticated
WITH CHECK (has_hr_access());

DROP POLICY IF EXISTS "secure_review_update" ON public.performance_reviews;
CREATE POLICY "secure_review_update"
ON public.performance_reviews FOR UPDATE
TO authenticated
USING (has_hr_access() OR (reviewer_id = auth.uid()))
WITH CHECK (has_hr_access() OR (reviewer_id = auth.uid()));

DROP POLICY IF EXISTS "secure_review_delete" ON public.performance_reviews;
CREATE POLICY "secure_review_delete"
ON public.performance_reviews FOR DELETE
TO authenticated
USING (has_hr_access());

-- Staff recognition policies
DROP POLICY IF EXISTS "staff_recognition_staff_access_select" ON public.staff_recognition;
CREATE POLICY "staff_recognition_staff_access_select"
ON public.staff_recognition FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "staff_recognition_hr_access_insert" ON public.staff_recognition;
CREATE POLICY "staff_recognition_hr_access_insert"
ON public.staff_recognition FOR INSERT
TO authenticated
WITH CHECK (has_hr_access());

DROP POLICY IF EXISTS "staff_recognition_hr_access_update" ON public.staff_recognition;
CREATE POLICY "staff_recognition_hr_access_update"
ON public.staff_recognition FOR UPDATE
TO authenticated
USING (has_hr_access())
WITH CHECK (has_hr_access());

DROP POLICY IF EXISTS "staff_recognition_admin_delete" ON public.staff_recognition;
CREATE POLICY "staff_recognition_admin_delete"
ON public.staff_recognition FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Staff votes policies
DROP POLICY IF EXISTS "staff_votes_authenticated_select" ON public.staff_votes;
CREATE POLICY "staff_votes_authenticated_select"
ON public.staff_votes FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "staff_votes_authenticated_insert" ON public.staff_votes;
CREATE POLICY "staff_votes_authenticated_insert"
ON public.staff_votes FOR INSERT
TO authenticated
WITH CHECK (has_hotel_staff_access());

DROP POLICY IF EXISTS "staff_votes_admin_delete" ON public.staff_votes;
CREATE POLICY "staff_votes_admin_delete"
ON public.staff_votes FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Employee access log policies
DROP POLICY IF EXISTS "Only admins can view access logs" ON public.employee_access_log;
CREATE POLICY "Only admins can view access logs"
ON public.employee_access_log FOR SELECT
TO authenticated
USING (get_current_user_role() = 'admin');

-- Suppliers policies
DROP POLICY IF EXISTS "secure_suppliers_select" ON public.suppliers;
CREATE POLICY "secure_suppliers_select"
ON public.suppliers FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement', 'staff'));

DROP POLICY IF EXISTS "secure_suppliers_insert" ON public.suppliers;
CREATE POLICY "secure_suppliers_insert"
ON public.suppliers FOR INSERT
TO authenticated
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

DROP POLICY IF EXISTS "secure_suppliers_update" ON public.suppliers;
CREATE POLICY "secure_suppliers_update"
ON public.suppliers FOR UPDATE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'))
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

DROP POLICY IF EXISTS "secure_suppliers_delete" ON public.suppliers;
CREATE POLICY "secure_suppliers_delete"
ON public.suppliers FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Supplier orders policies
DROP POLICY IF EXISTS "secure_supplier_orders_select" ON public.supplier_orders;
CREATE POLICY "secure_supplier_orders_select"
ON public.supplier_orders FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement', 'staff'));

DROP POLICY IF EXISTS "secure_supplier_orders_insert" ON public.supplier_orders;
CREATE POLICY "secure_supplier_orders_insert"
ON public.supplier_orders FOR INSERT
TO authenticated
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

DROP POLICY IF EXISTS "secure_supplier_orders_update" ON public.supplier_orders;
CREATE POLICY "secure_supplier_orders_update"
ON public.supplier_orders FOR UPDATE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'))
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

DROP POLICY IF EXISTS "secure_supplier_orders_delete" ON public.supplier_orders;
CREATE POLICY "secure_supplier_orders_delete"
ON public.supplier_orders FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Supplier order items policies
DROP POLICY IF EXISTS "Staff can view supplier order items" ON public.supplier_order_items;
CREATE POLICY "Staff can view supplier order items"
ON public.supplier_order_items FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement', 'staff'));

DROP POLICY IF EXISTS "Procurement can manage supplier order items" ON public.supplier_order_items;
CREATE POLICY "Procurement can manage supplier order items"
ON public.supplier_order_items FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'))
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

-- Supplier payments policies
DROP POLICY IF EXISTS "secure_supplier_payments_select" ON public.supplier_payments;
CREATE POLICY "secure_supplier_payments_select"
ON public.supplier_payments FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement', 'staff'));

DROP POLICY IF EXISTS "secure_supplier_payments_insert" ON public.supplier_payments;
CREATE POLICY "secure_supplier_payments_insert"
ON public.supplier_payments FOR INSERT
TO authenticated
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

DROP POLICY IF EXISTS "secure_supplier_payments_update" ON public.supplier_payments;
CREATE POLICY "secure_supplier_payments_update"
ON public.supplier_payments FOR UPDATE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'))
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'procurement'));

DROP POLICY IF EXISTS "secure_supplier_payments_delete" ON public.supplier_payments;
CREATE POLICY "secure_supplier_payments_delete"
ON public.supplier_payments FOR DELETE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Halls policies
DROP POLICY IF EXISTS "Staff can view halls" ON public.halls;
CREATE POLICY "Staff can view halls"
ON public.halls FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage halls" ON public.halls;
CREATE POLICY "Management can manage halls"
ON public.halls FOR ALL
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Hall bookings policies
DROP POLICY IF EXISTS "Staff can view hall bookings" ON public.hall_bookings;
CREATE POLICY "Staff can view hall bookings"
ON public.hall_bookings FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Staff can manage hall bookings" ON public.hall_bookings;
CREATE POLICY "Staff can manage hall bookings"
ON public.hall_bookings FOR ALL
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

-- Game stations policies
DROP POLICY IF EXISTS "Staff can view game stations" ON public.game_stations;
CREATE POLICY "Staff can view game stations"
ON public.game_stations FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage game stations" ON public.game_stations;
CREATE POLICY "Management can manage game stations"
ON public.game_stations FOR ALL
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Game sessions policies
DROP POLICY IF EXISTS "Staff can view game sessions" ON public.game_sessions;
CREATE POLICY "Staff can view game sessions"
ON public.game_sessions FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Staff can manage game sessions" ON public.game_sessions;
CREATE POLICY "Staff can manage game sessions"
ON public.game_sessions FOR ALL
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

-- Game tournaments policies
DROP POLICY IF EXISTS "Staff can view tournaments" ON public.game_tournaments;
CREATE POLICY "Staff can view tournaments"
ON public.game_tournaments FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage tournaments" ON public.game_tournaments;
CREATE POLICY "Management can manage tournaments"
ON public.game_tournaments FOR ALL
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Game bookings policies
DROP POLICY IF EXISTS "Staff can view game bookings" ON public.game_bookings;
CREATE POLICY "Staff can view game bookings"
ON public.game_bookings FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Staff can manage game bookings" ON public.game_bookings;
CREATE POLICY "Staff can manage game bookings"
ON public.game_bookings FOR ALL
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

-- Gym members policies
DROP POLICY IF EXISTS "Staff can view gym members" ON public.gym_members;
CREATE POLICY "Staff can view gym members"
ON public.gym_members FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage gym members" ON public.gym_members;
CREATE POLICY "Management can manage gym members"
ON public.gym_members FOR ALL
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Gym member checkins policies
DROP POLICY IF EXISTS "Staff can view gym checkins" ON public.gym_member_checkins;
CREATE POLICY "Staff can view gym checkins"
ON public.gym_member_checkins FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Staff can manage gym checkins" ON public.gym_member_checkins;
CREATE POLICY "Staff can manage gym checkins"
ON public.gym_member_checkins FOR ALL
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

-- Gym trainers policies
DROP POLICY IF EXISTS "Staff can view gym trainers" ON public.gym_trainers;
CREATE POLICY "Staff can view gym trainers"
ON public.gym_trainers FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage gym trainers" ON public.gym_trainers;
CREATE POLICY "Management can manage gym trainers"
ON public.gym_trainers FOR ALL
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Gym trainer bookings policies
DROP POLICY IF EXISTS "Staff can view trainer bookings" ON public.gym_trainer_bookings;
CREATE POLICY "Staff can view trainer bookings"
ON public.gym_trainer_bookings FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Staff can manage trainer bookings" ON public.gym_trainer_bookings;
CREATE POLICY "Staff can manage trainer bookings"
ON public.gym_trainer_bookings FOR ALL
TO authenticated
USING (has_hotel_staff_access())
WITH CHECK (has_hotel_staff_access());

-- Gym equipment policies
DROP POLICY IF EXISTS "Staff can view gym equipment" ON public.gym_equipment;
CREATE POLICY "Staff can view gym equipment"
ON public.gym_equipment FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Management can manage gym equipment" ON public.gym_equipment;
CREATE POLICY "Management can manage gym equipment"
ON public.gym_equipment FOR ALL
TO authenticated
USING (has_management_access())
WITH CHECK (has_management_access());

-- Housekeeping tasks policies
DROP POLICY IF EXISTS "Staff can view housekeeping tasks" ON public.housekeeping_tasks;
CREATE POLICY "Staff can view housekeeping tasks"
ON public.housekeeping_tasks FOR SELECT
TO authenticated
USING (has_hotel_staff_access());

DROP POLICY IF EXISTS "Housekeeping can manage tasks" ON public.housekeeping_tasks;
CREATE POLICY "Housekeeping can manage tasks"
ON public.housekeeping_tasks FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'housekeeping'))
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'housekeeping'));

-- Content pages policies
DROP POLICY IF EXISTS "Anyone can view published content" ON public.content_pages;
CREATE POLICY "Anyone can view published content"
ON public.content_pages FOR SELECT
TO authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Admins can view all content" ON public.content_pages;
CREATE POLICY "Admins can view all content"
ON public.content_pages FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage all content" ON public.content_pages;
CREATE POLICY "Admins can manage all content"
ON public.content_pages FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Financial reports policies
DROP POLICY IF EXISTS "Only financial staff can view reports" ON public.financial_reports;
CREATE POLICY "Only financial staff can view reports"
ON public.financial_reports FOR SELECT
TO authenticated
USING (has_financial_access());

DROP POLICY IF EXISTS "Only financial staff can create reports" ON public.financial_reports;
CREATE POLICY "Only financial staff can create reports"
ON public.financial_reports FOR INSERT
TO authenticated
WITH CHECK (has_financial_access());

-- =====================================================
-- PART 8: CREATE VIEWS
-- =====================================================

CREATE OR REPLACE VIEW public.financial_summary AS
SELECT 
  COALESCE(SUM(CASE WHEN ac.type = 'revenue' THEN ae.credit_amount ELSE 0 END), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN ac.type = 'expense' THEN ae.debit_amount ELSE 0 END), 0) as total_expenses,
  COALESCE(SUM(CASE WHEN ac.type = 'asset' THEN ae.debit_amount - ae.credit_amount ELSE 0 END), 0) as total_assets,
  COALESCE(SUM(CASE WHEN ac.type = 'liability' THEN ae.credit_amount - ae.debit_amount ELSE 0 END), 0) as total_liabilities,
  COALESCE(SUM(CASE WHEN ac.type = 'equity' THEN ae.credit_amount - ae.debit_amount ELSE 0 END), 0) as total_equity,
  COALESCE(SUM(CASE WHEN ac.type = 'revenue' THEN ae.credit_amount ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN ac.type = 'expense' THEN ae.debit_amount ELSE 0 END), 0) as net_income
FROM public.account_entries ae
LEFT JOIN public.account_categories ac ON ae.category_id = ac.id
WHERE ae.status = 'pending';

-- =====================================================
-- PART 9: INSERT DEFAULT DATA
-- =====================================================

-- Insert default account categories
INSERT INTO public.account_categories (name, type, account_code, description) VALUES
('Cash', 'asset', '1000', 'Cash on hand and in bank'),
('Accounts Receivable', 'asset', '1100', 'Money owed by customers'),
('Inventory', 'asset', '1200', 'Stock and supplies'),
('Accounts Payable', 'liability', '2000', 'Money owed to suppliers'),
('Loans Payable', 'liability', '2100', 'Outstanding loans'),
('Owner Equity', 'equity', '3000', 'Owner investment'),
('Room Revenue', 'revenue', '4000', 'Income from room bookings'),
('Restaurant Revenue', 'revenue', '4100', 'Income from restaurant sales'),
('Other Revenue', 'revenue', '4200', 'Other income sources'),
('Cost of Goods Sold', 'expense', '5000', 'Direct costs of inventory'),
('Salaries Expense', 'expense', '5100', 'Employee wages and salaries'),
('Utilities Expense', 'expense', '5200', 'Electricity, water, internet'),
('Maintenance Expense', 'expense', '5300', 'Repairs and maintenance'),
('Marketing Expense', 'expense', '5400', 'Advertising and promotions'),
('Administrative Expense', 'expense', '5500', 'General admin costs')
ON CONFLICT (account_code) DO NOTHING;

-- Insert hotel settings default
INSERT INTO public.hotel_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Insert rooms data
-- Rooms with 7000 rate (basic amenities)
INSERT INTO public.rooms (room_number, room_type, rate, status, floor_number, capacity, amenities) VALUES
('104', 'Standard', 7000, 'available', 1, 2, ARRAY['WiFi', 'Television', 'Reading Table & Chair']),
('106', 'Standard', 7000, 'available', 1, 2, ARRAY['WiFi', 'Television', 'Reading Table & Chair']),
('201', 'Standard', 7000, 'available', 2, 2, ARRAY['WiFi', 'Television', 'Reading Table & Chair']),
('209', 'Standard', 7000, 'available', 2, 2, ARRAY['WiFi', 'Television', 'Reading Table & Chair'])
ON CONFLICT (room_number) DO NOTHING;

-- Rooms with 20000 rate (full amenities)
INSERT INTO public.rooms (room_number, room_type, rate, status, floor_number, capacity, amenities) VALUES
('105', 'Deluxe', 20000, 'available', 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('210', 'Deluxe', 20000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('212', 'Deluxe', 20000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('213', 'Deluxe', 20000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power'])
ON CONFLICT (room_number) DO NOTHING;

-- Rooms with 17000 rate (full amenities)
INSERT INTO public.rooms (room_number, room_type, rate, status, floor_number, capacity, amenities) VALUES
('107', 'Superior', 17000, 'available', 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('108', 'Superior', 17000, 'available', 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power'])
ON CONFLICT (room_number) DO NOTHING;

-- Remaining Floor 1 rooms
INSERT INTO public.rooms (room_number, room_type, rate, status, floor_number, capacity, amenities) VALUES
('101', 'Standard', 10000, 'available', 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('102', 'Standard', 10000, 'available', 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('103', 'Standard', 10000, 'available', 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power'])
ON CONFLICT (room_number) DO NOTHING;

-- Remaining Floor 2 rooms
INSERT INTO public.rooms (room_number, room_type, rate, status, floor_number, capacity, amenities) VALUES
('202', 'Standard', 10000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('203', 'Standard', 10000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('204', 'Standard', 10000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('205', 'Standard', 10000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('206', 'Standard', 10000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('207', 'Standard', 10000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('208', 'Standard', 10000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('211', 'Standard', 10000, 'available', 2, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power'])
ON CONFLICT (room_number) DO NOTHING;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Owen's database is now fully configured and ready to use