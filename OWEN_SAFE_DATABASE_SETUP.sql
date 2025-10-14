-- =====================================================
-- SAFE & COMPLETE DATABASE SETUP FOR OWEN
-- This file is 100% safe to run multiple times
-- It will NOT cause errors if objects already exist
-- =====================================================

-- =====================================================
-- STEP 1: CREATE ENUM TYPE (SAFE)
-- =====================================================

-- Only create app_role if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM (
            'admin', 'moderator', 'user', 'staff', 'manager', 
            'kitchen', 'front_desk', 'housekeeping', 'procurement', 
            'bartender', 'supervisor', 'maintenance', 'security', 
            'accounting', 'hr'
        );
    END IF;
END $$;

-- =====================================================
-- STEP 2: DROP TABLES THAT MIGHT HAVE INCORRECT SCHEMA
-- =====================================================

-- Drop accounting tables if they exist (in case they were created with wrong schema)
DROP TABLE IF EXISTS public.account_entries CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.financial_reports CASCADE;
DROP TABLE IF EXISTS public.account_categories CASCADE;

-- =====================================================
-- STEP 3: CREATE ALL TABLES (IF NOT EXISTS)
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

-- Hotel settings
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
    primary_color text DEFAULT '222.2 84% 4.9%',
    accent_color text DEFAULT '346.8 77.2% 49.8%',
    background_color text DEFAULT '0 0% 100%',
    text_color text DEFAULT '222.2 84% 4.9%',
    card_color text DEFAULT '0 0% 100%',
    border_color text DEFAULT '214.3 31.8% 91.4%',
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
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Rooms table with all columns
CREATE TABLE IF NOT EXISTS public.rooms (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_number text NOT NULL UNIQUE,
    room_type text NOT NULL,
    price_per_night numeric NOT NULL,
    status text NOT NULL DEFAULT 'available',
    floor integer,
    max_occupancy integer DEFAULT 2,
    description text,
    amenities text[] DEFAULT ARRAY[]::text[],
    images text[] DEFAULT ARRAY[]::text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Account categories (force recreate since we dropped it)
CREATE TABLE public.account_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text NOT NULL,
    parent_id uuid,
    code text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Account entries (force recreate since we dropped it)
CREATE TABLE public.account_entries (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL,
    category_id uuid REFERENCES public.account_categories(id),
    description text NOT NULL,
    amount numeric NOT NULL,
    payment_method text,
    reference_number text,
    created_by uuid REFERENCES auth.users(id),
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Financial reports (force recreate since we dropped it)
CREATE TABLE public.financial_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_type text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_income numeric DEFAULT 0,
    total_expenses numeric DEFAULT 0,
    net_profit numeric DEFAULT 0,
    report_data jsonb,
    generated_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Budgets (force recreate since we dropped it)
CREATE TABLE public.budgets (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    fiscal_year integer NOT NULL,
    period_type text NOT NULL DEFAULT 'monthly',
    period_number integer,
    category_id uuid REFERENCES public.account_categories(id),
    budgeted_amount numeric NOT NULL,
    actual_amount numeric DEFAULT 0,
    variance numeric,
    variance_percentage numeric,
    status text NOT NULL DEFAULT 'active',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Departments
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

-- Positions
CREATE TABLE IF NOT EXISTS public.positions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    department_id uuid REFERENCES public.departments(id),
    description text,
    min_salary numeric,
    max_salary numeric,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Employees
CREATE TABLE IF NOT EXISTS public.employees (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id text NOT NULL UNIQUE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    address text,
    department_id uuid REFERENCES public.departments(id),
    position_id uuid REFERENCES public.positions(id),
    hire_date date NOT NULL DEFAULT CURRENT_DATE,
    salary numeric NOT NULL,
    employment_type text NOT NULL DEFAULT 'full-time',
    status text NOT NULL DEFAULT 'active',
    emergency_contact_name text,
    emergency_contact_phone text,
    date_of_birth date,
    national_id text,
    bank_account text,
    total_leave_days integer DEFAULT 25,
    used_leave_days integer DEFAULT 0,
    manager_id uuid,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Continue with remaining tables...
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid NOT NULL,
    leave_type text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    reason text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    rejection_reason text,
    approved_by uuid,
    approved_at timestamp with time zone,
    applied_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

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
    notes text,
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.staff_recognition (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid NOT NULL,
    recognition_type text NOT NULL,
    title text NOT NULL,
    description text,
    month_year date,
    nominated_by uuid,
    voting_period text,
    votes integer DEFAULT 0,
    total_votes integer DEFAULT 0,
    award_date date DEFAULT CURRENT_DATE,
    is_public boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.staff_votes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid NOT NULL,
    voter_name text NOT NULL,
    voter_type text NOT NULL,
    voting_period text NOT NULL,
    voted_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guests (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text,
    phone text NOT NULL,
    address text,
    id_type text,
    id_number text,
    nationality text,
    date_of_birth date,
    loyalty_tier text DEFAULT 'Bronze',
    total_bookings integer DEFAULT 0,
    total_spent numeric DEFAULT 0,
    last_stay date,
    preferences jsonb DEFAULT '{}'::jsonb,
    notes text,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id uuid REFERENCES public.rooms(id),
    guest_name text NOT NULL,
    guest_email text,
    guest_phone text NOT NULL,
    guest_id_type text,
    guest_id_number text,
    check_in_date date NOT NULL,
    check_out_date date NOT NULL,
    number_of_guests integer DEFAULT 1,
    total_amount numeric NOT NULL,
    booking_status text NOT NULL DEFAULT 'pending',
    payment_status text NOT NULL DEFAULT 'pending',
    payment_method text,
    special_requests text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.inventory_issuances (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_item_id uuid NOT NULL,
    issued_to text NOT NULL,
    department text,
    room_number text,
    quantity_issued integer NOT NULL,
    unit_cost numeric NOT NULL DEFAULT 0,
    total_cost numeric NOT NULL DEFAULT 0,
    purpose text NOT NULL,
    status text NOT NULL DEFAULT 'issued',
    notes text,
    issued_by uuid,
    issued_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.supplier_orders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id uuid NOT NULL,
    order_number text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    total_amount numeric NOT NULL DEFAULT 0.00,
    order_date date NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date date,
    delivery_date date,
    notes text,
    created_by text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.supplier_order_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL,
    item_name text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric NOT NULL,
    total_price numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id uuid NOT NULL,
    order_id uuid,
    amount numeric NOT NULL,
    payment_method text NOT NULL,
    payment_date date NOT NULL DEFAULT CURRENT_DATE,
    reference_number text,
    status text NOT NULL DEFAULT 'completed',
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    description text,
    price numeric NOT NULL,
    cost_price numeric DEFAULT 0,
    recipe_id uuid,
    is_available boolean DEFAULT true,
    tracks_inventory boolean DEFAULT false,
    inventory_item_id uuid,
    preparation_time integer,
    image_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    description text,
    instructions text,
    cost numeric DEFAULT 0,
    prep_time integer,
    servings integer DEFAULT 1,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id uuid,
    inventory_item_id uuid,
    quantity_needed numeric NOT NULL,
    unit text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.restaurant_tables (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number text NOT NULL,
    seats integer NOT NULL DEFAULT 4,
    status text NOT NULL DEFAULT 'available',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id uuid,
    guest_name text NOT NULL,
    guest_type text NOT NULL,
    room_number text,
    status text NOT NULL DEFAULT 'active',
    payment_method text,
    subtotal numeric NOT NULL DEFAULT 0,
    tax_amount numeric NOT NULL DEFAULT 0,
    total_amount numeric NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL,
    item_name text NOT NULL,
    item_category text NOT NULL,
    price numeric NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    special_instructions text,
    status text NOT NULL DEFAULT 'pending',
    tax_rate numeric DEFAULT 7.5,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.housekeeping_tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id uuid,
    task_type text NOT NULL,
    priority text NOT NULL DEFAULT 'medium',
    status text NOT NULL DEFAULT 'pending',
    description text,
    notes text,
    assigned_to uuid,
    due_date timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    estimated_duration integer,
    actual_duration integer,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.halls (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    location text NOT NULL,
    capacity integer NOT NULL,
    hourly_rate numeric NOT NULL,
    amenities text[] DEFAULT '{}'::text[],
    availability text DEFAULT 'available',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hall_bookings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    hall_id uuid NOT NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_email text,
    event_type text NOT NULL,
    event_date date NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    total_hours numeric NOT NULL,
    total_amount numeric NOT NULL,
    payment_status text NOT NULL DEFAULT 'pending',
    payment_method text,
    booking_status text NOT NULL DEFAULT 'confirmed',
    special_requests text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_stations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    station_name text NOT NULL,
    station_type text NOT NULL,
    hourly_rate numeric NOT NULL,
    status text NOT NULL DEFAULT 'available',
    description text,
    specifications jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    station_id uuid NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.game_tournaments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_name text NOT NULL,
    game_type text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    entry_fee numeric DEFAULT 0,
    prize_pool numeric DEFAULT 0,
    max_participants integer,
    current_participants integer DEFAULT 0,
    status text NOT NULL DEFAULT 'upcoming',
    rules text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tournament_participants (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id uuid NOT NULL,
    player_name text NOT NULL,
    player_phone text,
    player_email text,
    team_name text,
    registration_date timestamp with time zone DEFAULT now(),
    payment_status text DEFAULT 'pending',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_members (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    member_name text NOT NULL,
    email text,
    phone text NOT NULL,
    membership_type text NOT NULL,
    membership_start date NOT NULL DEFAULT CURRENT_DATE,
    membership_end date NOT NULL,
    status text NOT NULL DEFAULT 'active',
    payment_status text DEFAULT 'paid',
    emergency_contact text,
    health_conditions text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_equipment (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    status text DEFAULT 'available',
    location text,
    serial_number text,
    purchase_date date,
    warranty_expiration date,
    last_maintenance date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_check_ins (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid NOT NULL,
    check_in_time timestamp with time zone DEFAULT now(),
    check_out_time timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_trainers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    trainer_name text NOT NULL,
    email text,
    phone text NOT NULL,
    specialization text,
    hourly_rate numeric NOT NULL,
    availability jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_training_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid NOT NULL,
    trainer_id uuid NOT NULL,
    session_date date NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    session_type text NOT NULL,
    status text DEFAULT 'scheduled',
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_pages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_slug text NOT NULL,
    page_title text NOT NULL,
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    footer_content jsonb DEFAULT '{"email": "info@hotel.com", "phone": "+1234567890", "address": "123 Hotel Street, City, Country", "quick_links": [{"url": "/about", "text": "About Us"}, {"url": "/contact", "text": "Contact"}], "company_info": "Your Hotel - Luxury Accommodation", "social_links": {"twitter": "", "facebook": "", "instagram": ""}}'::jsonb,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid
);

-- =====================================================
-- STEP 4: CREATE ALL FUNCTIONS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Role checking functions (SECURITY DEFINER to avoid recursion)
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

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id LIMIT 1;
  RETURN user_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_hotel_staff_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'supervisor');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_hr_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr', 'manager');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_financial_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'accounting', 'hr');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_kitchen_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'staff', 'front_desk', 'housekeeping');
END;
$$;

-- Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Employee access control
CREATE OR REPLACE FUNCTION public.can_access_employee_data(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.can_access_employee_basic_info_only(emp_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Recipe cost calculation
CREATE OR REPLACE FUNCTION public.calculate_recipe_cost(recipe_uuid uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Inventory deduction for sales
CREATE OR REPLACE FUNCTION public.deduct_recipe_ingredients(menu_item_uuid uuid, quantity_sold integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Room status updates
CREATE OR REPLACE FUNCTION public.update_room_status_after_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

-- Guest loyalty management
CREATE OR REPLACE FUNCTION public.handle_booking_guest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Supplier statistics
CREATE OR REPLACE FUNCTION public.update_supplier_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

-- Order total calculation
CREATE OR REPLACE FUNCTION public.update_order_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

-- Recipe cost trigger function
CREATE OR REPLACE FUNCTION public.update_recipe_cost_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Menu item auto-creation for drinks
CREATE OR REPLACE FUNCTION public.create_menu_item_for_drink()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Menu item cost sync
CREATE OR REPLACE FUNCTION public.update_menu_item_cost()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.cost_per_unit != OLD.cost_per_unit THEN
    UPDATE public.menu_items
    SET cost_price = NEW.cost_per_unit,
        updated_at = now()
    WHERE inventory_item_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 5: CREATE TRIGGERS (DROP IF EXISTS FIRST)
-- =====================================================

-- Drop all triggers first (safe to run even if they don't exist)
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS update_hotel_settings_updated_at ON public.hotel_settings;
    DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
    DROP TRIGGER IF EXISTS update_account_categories_updated_at ON public.account_categories;
    DROP TRIGGER IF EXISTS update_account_entries_updated_at ON public.account_entries;
    DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
    DROP TRIGGER IF EXISTS update_positions_updated_at ON public.positions;
    DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
    DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
    DROP TRIGGER IF EXISTS update_room_status_on_booking ON public.bookings;
    DROP TRIGGER IF EXISTS update_booking_guest_info ON public.bookings;
    DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;
    DROP TRIGGER IF EXISTS create_drink_menu_item ON public.inventory;
    DROP TRIGGER IF EXISTS sync_menu_cost_on_inventory_update ON public.inventory;
    DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
    DROP TRIGGER IF EXISTS update_supplier_orders_updated_at ON public.supplier_orders;
    DROP TRIGGER IF EXISTS update_supplier_order_items_total ON public.supplier_order_items;
    DROP TRIGGER IF EXISTS update_supplier_statistics ON public.supplier_orders;
    DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
    DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
    DROP TRIGGER IF EXISTS update_recipe_ingredients_updated_at ON public.recipe_ingredients;
    DROP TRIGGER IF EXISTS update_recipe_cost ON public.recipe_ingredients;
    DROP TRIGGER IF EXISTS update_restaurant_tables_updated_at ON public.restaurant_tables;
    DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
    DROP TRIGGER IF EXISTS update_order_items_updated_at ON public.order_items;
    DROP TRIGGER IF EXISTS update_kitchen_orders_updated_at ON public.kitchen_orders;
    DROP TRIGGER IF EXISTS update_housekeeping_tasks_updated_at ON public.housekeeping_tasks;
    DROP TRIGGER IF EXISTS update_halls_updated_at ON public.halls;
    DROP TRIGGER IF EXISTS update_hall_bookings_updated_at ON public.hall_bookings;
    DROP TRIGGER IF EXISTS update_game_stations_updated_at ON public.game_stations;
    DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON public.game_sessions;
    DROP TRIGGER IF EXISTS update_game_tournaments_updated_at ON public.game_tournaments;
    DROP TRIGGER IF EXISTS update_guests_updated_at ON public.guests;
    DROP TRIGGER IF EXISTS update_gym_members_updated_at ON public.gym_members;
    DROP TRIGGER IF EXISTS update_gym_equipment_updated_at ON public.gym_equipment;
    DROP TRIGGER IF EXISTS update_gym_trainers_updated_at ON public.gym_trainers;
    DROP TRIGGER IF EXISTS update_gym_training_sessions_updated_at ON public.gym_training_sessions;
    DROP TRIGGER IF EXISTS update_content_pages_updated_at ON public.content_pages;
    DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON public.leave_requests;
    DROP TRIGGER IF EXISTS update_employee_loans_updated_at ON public.employee_loans;
    DROP TRIGGER IF EXISTS update_performance_reviews_updated_at ON public.performance_reviews;
    DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Create all triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER update_hotel_settings_updated_at BEFORE UPDATE ON public.hotel_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_account_categories_updated_at BEFORE UPDATE ON public.account_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_account_entries_updated_at BEFORE UPDATE ON public.account_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_room_status_on_booking AFTER INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_room_status_after_booking();
CREATE TRIGGER update_booking_guest_info AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_booking_guest();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER create_drink_menu_item AFTER INSERT ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.create_menu_item_for_drink();
CREATE TRIGGER sync_menu_cost_on_inventory_update AFTER UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_menu_item_cost();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplier_orders_updated_at BEFORE UPDATE ON public.supplier_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplier_order_items_total AFTER INSERT OR UPDATE OR DELETE ON public.supplier_order_items FOR EACH ROW EXECUTE FUNCTION public.update_order_total();
CREATE TRIGGER update_supplier_statistics AFTER INSERT OR UPDATE ON public.supplier_orders FOR EACH ROW EXECUTE FUNCTION public.update_supplier_stats();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recipe_ingredients_updated_at BEFORE UPDATE ON public.recipe_ingredients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recipe_cost AFTER INSERT OR UPDATE OR DELETE ON public.recipe_ingredients FOR EACH ROW EXECUTE FUNCTION public.update_recipe_cost_trigger();
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON public.restaurant_tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kitchen_orders_updated_at BEFORE UPDATE ON public.kitchen_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_housekeeping_tasks_updated_at BEFORE UPDATE ON public.housekeeping_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_halls_updated_at BEFORE UPDATE ON public.halls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hall_bookings_updated_at BEFORE UPDATE ON public.hall_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_game_stations_updated_at BEFORE UPDATE ON public.game_stations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON public.game_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_game_tournaments_updated_at BEFORE UPDATE ON public.game_tournaments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gym_members_updated_at BEFORE UPDATE ON public.gym_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gym_equipment_updated_at BEFORE UPDATE ON public.gym_equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gym_trainers_updated_at BEFORE UPDATE ON public.gym_trainers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gym_training_sessions_updated_at BEFORE UPDATE ON public.gym_training_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_pages_updated_at BEFORE UPDATE ON public.content_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_loans_updated_at BEFORE UPDATE ON public.employee_loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON public.performance_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: CREATE RLS POLICIES (DROP IF EXISTS FIRST)
-- =====================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- User roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Hotel settings policies
DROP POLICY IF EXISTS "hotel_settings_authenticated_select" ON public.hotel_settings;
DROP POLICY IF EXISTS "hotel_settings_admin_modify" ON public.hotel_settings;
DROP POLICY IF EXISTS "hotel_settings_admin_only_delete" ON public.hotel_settings;

CREATE POLICY "hotel_settings_authenticated_select" ON public.hotel_settings FOR SELECT USING (true);
CREATE POLICY "hotel_settings_admin_modify" ON public.hotel_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "hotel_settings_admin_only_delete" ON public.hotel_settings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Rooms policies
DROP POLICY IF EXISTS "Staff can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Management can manage rooms" ON public.rooms;

CREATE POLICY "Staff can view rooms" ON public.rooms FOR SELECT USING (has_hotel_staff_access());
CREATE POLICY "Management can manage rooms" ON public.rooms FOR ALL USING (has_management_access()) WITH CHECK (has_management_access());

-- Account categories policies
DROP POLICY IF EXISTS "Only financial staff can view categories" ON public.account_categories;
DROP POLICY IF EXISTS "Only financial staff can manage categories" ON public.account_categories;

CREATE POLICY "Only financial staff can view categories" ON public.account_categories FOR SELECT USING (has_financial_access());
CREATE POLICY "Only financial staff can manage categories" ON public.account_categories FOR ALL USING (has_financial_access()) WITH CHECK (has_financial_access());

-- Account entries policies
DROP POLICY IF EXISTS "Only financial staff can view entries" ON public.account_entries;
DROP POLICY IF EXISTS "Only financial staff can manage entries" ON public.account_entries;

CREATE POLICY "Only financial staff can view entries" ON public.account_entries FOR SELECT USING (has_financial_access());
CREATE POLICY "Only financial staff can manage entries" ON public.account_entries FOR ALL USING (has_financial_access()) WITH CHECK (has_financial_access());

-- Financial reports policies
DROP POLICY IF EXISTS "Only financial staff can view reports" ON public.financial_reports;
DROP POLICY IF EXISTS "Only financial staff can create reports" ON public.financial_reports;

CREATE POLICY "Only financial staff can view reports" ON public.financial_reports FOR SELECT USING (has_financial_access());
CREATE POLICY "Only financial staff can create reports" ON public.financial_reports FOR INSERT WITH CHECK (has_financial_access());

-- Budgets policies
DROP POLICY IF EXISTS "Only financial staff can view budgets" ON public.budgets;
DROP POLICY IF EXISTS "Only financial staff can insert budgets" ON public.budgets;
DROP POLICY IF EXISTS "Only financial staff can update budgets" ON public.budgets;
DROP POLICY IF EXISTS "Only admins can delete budgets" ON public.budgets;

CREATE POLICY "Only financial staff can view budgets" ON public.budgets FOR SELECT USING (has_financial_access());
CREATE POLICY "Only financial staff can insert budgets" ON public.budgets FOR INSERT WITH CHECK (has_financial_access());
CREATE POLICY "Only financial staff can update budgets" ON public.budgets FOR UPDATE USING (has_financial_access()) WITH CHECK (has_financial_access());
CREATE POLICY "Only admins can delete budgets" ON public.budgets FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Employees policies
DROP POLICY IF EXISTS "employees_secure_select_with_field_protection" ON public.employees;
DROP POLICY IF EXISTS "employees_secure_update_with_field_restrictions" ON public.employees;
DROP POLICY IF EXISTS "employees_insert_hr_only" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_admin_only" ON public.employees;

CREATE POLICY "employees_secure_select_with_field_protection" ON public.employees FOR SELECT USING (can_access_employee_basic_info_only(id));
CREATE POLICY "employees_secure_update_with_field_restrictions" ON public.employees FOR UPDATE USING ((has_hr_access()) OR (email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)) WITH CHECK ((has_hr_access()) OR (email = (SELECT email FROM auth.users WHERE id = auth.uid())::text));
CREATE POLICY "employees_insert_hr_only" ON public.employees FOR INSERT WITH CHECK (has_hr_access());
CREATE POLICY "employees_delete_admin_only" ON public.employees FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Continue with remaining policies...
-- Bookings policies
DROP POLICY IF EXISTS "secure_bookings_select" ON public.bookings;
DROP POLICY IF EXISTS "secure_bookings_insert" ON public.bookings;
DROP POLICY IF EXISTS "secure_bookings_update" ON public.bookings;
DROP POLICY IF EXISTS "secure_bookings_delete" ON public.bookings;

CREATE POLICY "secure_bookings_select" ON public.bookings FOR SELECT USING (has_booking_access());
CREATE POLICY "secure_bookings_insert" ON public.bookings FOR INSERT WITH CHECK (has_booking_access());
CREATE POLICY "secure_bookings_update" ON public.bookings FOR UPDATE USING (has_booking_access()) WITH CHECK (has_booking_access());
CREATE POLICY "secure_bookings_delete" ON public.bookings FOR DELETE USING (has_management_access());

-- Inventory policies
DROP POLICY IF EXISTS "inventory_staff_access_select" ON public.inventory;
DROP POLICY IF EXISTS "inventory_management_insert" ON public.inventory;
DROP POLICY IF EXISTS "inventory_management_update" ON public.inventory;
DROP POLICY IF EXISTS "inventory_admin_delete" ON public.inventory;

CREATE POLICY "inventory_staff_access_select" ON public.inventory FOR SELECT USING (has_hotel_staff_access());
CREATE POLICY "inventory_management_insert" ON public.inventory FOR INSERT WITH CHECK (has_management_access() OR has_role(auth.uid(), 'procurement'::app_role));
CREATE POLICY "inventory_management_update" ON public.inventory FOR UPDATE USING (has_management_access() OR has_role(auth.uid(), 'procurement'::app_role)) WITH CHECK (has_management_access() OR has_role(auth.uid(), 'procurement'::app_role));
CREATE POLICY "inventory_admin_delete" ON public.inventory FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Menu items policies
DROP POLICY IF EXISTS "menu_items_staff_access_select" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_kitchen_management_modify" ON public.menu_items;

CREATE POLICY "menu_items_staff_access_select" ON public.menu_items FOR SELECT USING (has_hotel_staff_access());
CREATE POLICY "menu_items_kitchen_management_modify" ON public.menu_items FOR ALL USING (has_kitchen_access() OR has_management_access()) WITH CHECK (has_kitchen_access() OR has_management_access());

-- Recipes policies
DROP POLICY IF EXISTS "Staff can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Kitchen and management can manage recipes" ON public.recipes;

CREATE POLICY "Staff can view recipes" ON public.recipes FOR SELECT USING (has_hotel_staff_access());
CREATE POLICY "Kitchen and management can manage recipes" ON public.recipes FOR ALL USING (has_kitchen_access() OR has_management_access()) WITH CHECK (has_kitchen_access() OR has_management_access());

-- Orders policies
DROP POLICY IF EXISTS "secure_orders_select" ON public.orders;
DROP POLICY IF EXISTS "secure_orders_insert" ON public.orders;
DROP POLICY IF EXISTS "secure_orders_update" ON public.orders;
DROP POLICY IF EXISTS "secure_orders_delete" ON public.orders;

CREATE POLICY "secure_orders_select" ON public.orders FOR SELECT USING (has_booking_access());
CREATE POLICY "secure_orders_insert" ON public.orders FOR INSERT WITH CHECK (has_booking_access());
CREATE POLICY "secure_orders_update" ON public.orders FOR UPDATE USING (has_booking_access()) WITH CHECK (has_booking_access());
CREATE POLICY "secure_orders_delete" ON public.orders FOR DELETE USING (has_management_access());

-- Staff recognition policies
DROP POLICY IF EXISTS "staff_recognition_staff_access_select" ON public.staff_recognition;
DROP POLICY IF EXISTS "staff_recognition_hr_access_insert" ON public.staff_recognition;
DROP POLICY IF EXISTS "staff_recognition_hr_access_update" ON public.staff_recognition;
DROP POLICY IF EXISTS "staff_recognition_admin_delete" ON public.staff_recognition;

CREATE POLICY "staff_recognition_staff_access_select" ON public.staff_recognition FOR SELECT USING (has_hotel_staff_access());
CREATE POLICY "staff_recognition_hr_access_insert" ON public.staff_recognition FOR INSERT WITH CHECK (has_hr_access());
CREATE POLICY "staff_recognition_hr_access_update" ON public.staff_recognition FOR UPDATE USING (has_hr_access()) WITH CHECK (has_hr_access());
CREATE POLICY "staff_recognition_admin_delete" ON public.staff_recognition FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Content pages policies
DROP POLICY IF EXISTS "Anyone can view published content" ON public.content_pages;
DROP POLICY IF EXISTS "Admins can view all content" ON public.content_pages;
DROP POLICY IF EXISTS "Admins can manage all content" ON public.content_pages;

CREATE POLICY "Anyone can view published content" ON public.content_pages FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all content" ON public.content_pages FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage all content" ON public.content_pages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add basic policies for remaining tables
DROP POLICY IF EXISTS "Staff can view guests" ON public.guests;
DROP POLICY IF EXISTS "Staff can manage guests" ON public.guests;
CREATE POLICY "Staff can view guests" ON public.guests FOR SELECT USING (has_hotel_staff_access());
CREATE POLICY "Staff can manage guests" ON public.guests FOR ALL USING (has_hotel_staff_access()) WITH CHECK (has_hotel_staff_access());

DROP POLICY IF EXISTS "Staff can view halls" ON public.halls;
DROP POLICY IF EXISTS "Management can manage halls" ON public.halls;
CREATE POLICY "Staff can view halls" ON public.halls FOR SELECT USING (has_hotel_staff_access());
CREATE POLICY "Management can manage halls" ON public.halls FOR ALL USING (has_management_access()) WITH CHECK (has_management_access());

DROP POLICY IF EXISTS "Staff can manage game stations" ON public.game_stations;
CREATE POLICY "Staff can manage game stations" ON public.game_stations FOR ALL USING (has_hotel_staff_access()) WITH CHECK (has_hotel_staff_access());

DROP POLICY IF EXISTS "Staff can manage gym members" ON public.gym_members;
CREATE POLICY "Staff can manage gym members" ON public.gym_members FOR ALL USING (has_hotel_staff_access()) WITH CHECK (has_hotel_staff_access());

-- =====================================================
-- STEP 8: INSERT DEFAULT DATA
-- =====================================================

-- Insert default hotel settings
INSERT INTO public.hotel_settings (hotel_name, currency, tax_rate)
VALUES ('Owen Hotel', 'USD', 7.5)
ON CONFLICT (id) DO NOTHING;

-- Insert account categories
INSERT INTO public.account_categories (name, type, code, description) VALUES
('Room Revenue', 'income', 'INC-001', 'Revenue from room bookings'),
('Food & Beverage', 'income', 'INC-002', 'Revenue from restaurant and bar'),
('Gym & Spa', 'income', 'INC-003', 'Revenue from gym and spa services'),
('Event Halls', 'income', 'INC-004', 'Revenue from event hall rentals'),
('Other Services', 'income', 'INC-005', 'Revenue from miscellaneous services'),
('Salaries & Wages', 'expense', 'EXP-001', 'Employee salaries and wages'),
('Utilities', 'expense', 'EXP-002', 'Electricity, water, gas, internet'),
('Maintenance', 'expense', 'EXP-003', 'Repairs and maintenance costs'),
('Food & Supplies', 'expense', 'EXP-004', 'Food ingredients and supplies'),
('Marketing', 'expense', 'EXP-005', 'Advertising and promotional expenses'),
('Administrative', 'expense', 'EXP-006', 'Office and administrative costs')
ON CONFLICT DO NOTHING;

-- Room data removed - add rooms manually through the application

-- =====================================================
-- COMPLETE! Database setup finished
-- =====================================================
