-- Create comprehensive HR management tables (fixed syntax error)

-- Departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID,
  budget NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee positions/roles
CREATE TABLE public.employee_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  min_salary NUMERIC(10,2),
  max_salary NUMERIC(10,2),
  description TEXT,
  requirements TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  department_id UUID REFERENCES public.departments(id),
  position_id UUID REFERENCES public.employee_positions(id),
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  salary NUMERIC(10,2) NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on-leave', 'terminated', 'suspended')),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  date_of_birth DATE,
  national_id TEXT,
  bank_account TEXT,
  total_leave_days INTEGER DEFAULT 25,
  used_leave_days INTEGER DEFAULT 0,
  manager_id UUID REFERENCES public.employees(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave requests
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  leave_type TEXT NOT NULL CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid', 'compassionate')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES public.employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee loans
CREATE TABLE public.employee_loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  loan_amount NUMERIC(10,2) NOT NULL,
  purpose TEXT NOT NULL,
  monthly_deduction NUMERIC(10,2) NOT NULL,
  remaining_amount NUMERIC(10,2) NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  approved_by UUID REFERENCES public.employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payroll records
CREATE TABLE public.payroll_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  base_salary NUMERIC(10,2) NOT NULL,
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  overtime_rate NUMERIC(8,2) DEFAULT 0,
  bonus NUMERIC(10,2) DEFAULT 0,
  loan_deduction NUMERIC(10,2) DEFAULT 0,
  tax_deduction NUMERIC(10,2) DEFAULT 0,
  other_deductions NUMERIC(10,2) DEFAULT 0,
  gross_pay NUMERIC(10,2) NOT NULL,
  net_pay NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid')),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance reviews
CREATE TABLE public.performance_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  reviewer_id UUID NOT NULL REFERENCES public.employees(id),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  overall_rating NUMERIC(3,1) CHECK (overall_rating >= 1 AND overall_rating <= 5),
  goals_achievement NUMERIC(3,1) CHECK (goals_achievement >= 1 AND goals_achievement <= 5),
  teamwork NUMERIC(3,1) CHECK (teamwork >= 1 AND teamwork <= 5),
  communication NUMERIC(3,1) CHECK (communication >= 1 AND communication <= 5),
  leadership NUMERIC(3,1) CHECK (leadership >= 1 AND leadership <= 5),
  strengths TEXT,
  areas_for_improvement TEXT,
  goals_next_period TEXT,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'final')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Staff recognition/awards
CREATE TABLE public.staff_recognition (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  recognition_type TEXT NOT NULL CHECK (recognition_type IN ('employee_of_month', 'achievement', 'milestone', 'customer_praise', 'peer_nomination')),
  title TEXT NOT NULL,
  description TEXT,
  month_year DATE, -- for employee of the month
  nominated_by UUID REFERENCES public.employees(id),
  votes INTEGER DEFAULT 0,
  award_date DATE DEFAULT CURRENT_DATE,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_recognition ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now)
CREATE POLICY "Allow all operations on departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on employee_positions" ON public.employee_positions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on leave_requests" ON public.leave_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on employee_loans" ON public.employee_loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payroll_records" ON public.payroll_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on performance_reviews" ON public.performance_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on staff_recognition" ON public.staff_recognition FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_loans_updated_at BEFORE UPDATE ON public.employee_loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON public.performance_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample departments
INSERT INTO public.departments (name, code, description, budget) VALUES
('Front Desk', 'FD', 'Guest services and reception', 180000),
('Housekeeping', 'HK', 'Room cleaning and maintenance', 150000),
('Kitchen', 'KT', 'Food preparation and cooking', 200000),
('Maintenance', 'MT', 'Hotel maintenance and repairs', 120000),
('Management', 'MG', 'Hotel administration and management', 250000),
('Security', 'SC', 'Hotel security and safety', 100000);

-- Insert sample positions (fixed alias)
INSERT INTO public.employee_positions (title, department_id, min_salary, max_salary, description) 
SELECT 
  pos.title,
  d.id,
  pos.min_sal,
  pos.max_sal,
  pos.job_description
FROM public.departments d
CROSS JOIN (
  VALUES 
    ('Manager', 60000, 80000, 'Department management and supervision'),
    ('Supervisor', 45000, 60000, 'Team supervision and coordination'),
    ('Associate', 30000, 45000, 'Entry to mid-level position'),
    ('Trainee', 25000, 35000, 'Entry-level training position')
) AS pos(title, min_sal, max_sal, job_description);

-- Insert sample employees
INSERT INTO public.employees (
  employee_id, first_name, last_name, email, phone, address, department_id, position_id, 
  salary, employment_type, emergency_contact_name, emergency_contact_phone, total_leave_days, used_leave_days
) VALUES 
('EMP001', 'Maria', 'Santos', 'maria.santos@hotel.com', '+1-555-123-4567', '123 Main St, City, State', 
 (SELECT id FROM public.departments WHERE code = 'HK'), 
 (SELECT id FROM public.employee_positions WHERE title = 'Supervisor' AND department_id = (SELECT id FROM public.departments WHERE code = 'HK') LIMIT 1),
 45000, 'full-time', 'Carlos Santos', '+1-555-765-4321', 25, 8),
 
('EMP002', 'James', 'Wilson', 'james.wilson@hotel.com', '+1-555-234-5678', '456 Oak Ave, City, State',
 (SELECT id FROM public.departments WHERE code = 'FD'),
 (SELECT id FROM public.employee_positions WHERE title = 'Manager' AND department_id = (SELECT id FROM public.departments WHERE code = 'FD') LIMIT 1),
 52000, 'full-time', 'Sarah Wilson', '+1-555-876-5432', 25, 12),
 
('EMP003', 'Roberto', 'Martinez', 'chef.martinez@hotel.com', '+1-555-345-6789', '789 Pine St, City, State',
 (SELECT id FROM public.departments WHERE code = 'KT'),
 (SELECT id FROM public.employee_positions WHERE title = 'Manager' AND department_id = (SELECT id FROM public.departments WHERE code = 'KT') LIMIT 1),
 65000, 'full-time', 'Elena Martinez', '+1-555-987-6543', 28, 15),
 
('EMP004', 'Sarah', 'Johnson', 'sarah.johnson@hotel.com', '+1-555-456-7890', '321 Elm St, City, State',
 (SELECT id FROM public.departments WHERE code = 'FD'),
 (SELECT id FROM public.employee_positions WHERE title = 'Associate' AND department_id = (SELECT id FROM public.departments WHERE code = 'FD') LIMIT 1),
 38000, 'full-time', 'Mike Johnson', '+1-555-654-3210', 25, 5),
 
('EMP005', 'David', 'Brown', 'david.brown@hotel.com', '+1-555-567-8901', '654 Maple Ave, City, State',
 (SELECT id FROM public.departments WHERE code = 'MT'),
 (SELECT id FROM public.employee_positions WHERE title = 'Supervisor' AND department_id = (SELECT id FROM public.departments WHERE code = 'MT') LIMIT 1),
 48000, 'full-time', 'Lisa Brown', '+1-555-543-2109', 25, 10);

-- Add foreign key constraint for department manager after employees are inserted
ALTER TABLE public.departments ADD CONSTRAINT fk_departments_manager FOREIGN KEY (manager_id) REFERENCES public.employees(id);

-- Insert sample leave requests
INSERT INTO public.leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status) VALUES
((SELECT id FROM public.employees WHERE employee_id = 'EMP001'), 'annual', '2024-02-15', '2024-02-20', 6, 'Family vacation', 'pending'),
((SELECT id FROM public.employees WHERE employee_id = 'EMP002'), 'sick', '2024-01-18', '2024-01-19', 2, 'Medical appointment and recovery', 'approved'),
((SELECT id FROM public.employees WHERE employee_id = 'EMP003'), 'annual', '2024-03-01', '2024-03-07', 7, 'Personal time off', 'pending');

-- Insert sample loans
INSERT INTO public.employee_loans (employee_id, loan_amount, purpose, monthly_deduction, remaining_amount, status) VALUES
((SELECT id FROM public.employees WHERE employee_id = 'EMP003'), 5000, 'Home renovation', 500, 2500, 'active'),
((SELECT id FROM public.employees WHERE employee_id = 'EMP001'), 2000, 'Medical expenses', 200, 1800, 'active');

-- Insert sample staff recognition
INSERT INTO public.staff_recognition (employee_id, recognition_type, title, description, month_year, votes) VALUES
((SELECT id FROM public.employees WHERE employee_id = 'EMP003'), 'employee_of_month', 'Employee of the Month - January 2024', 'Outstanding performance in kitchen operations', '2024-01-01', 15),
((SELECT id FROM public.employees WHERE employee_id = 'EMP001'), 'employee_of_month', 'Employee of the Month Nominee', 'Excellent housekeeping standards', '2024-01-01', 12),
((SELECT id FROM public.employees WHERE employee_id = 'EMP002'), 'employee_of_month', 'Employee of the Month Nominee', 'Great customer service', '2024-01-01', 8);