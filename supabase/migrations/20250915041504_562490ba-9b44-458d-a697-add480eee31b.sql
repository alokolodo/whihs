-- Create accounting tables for a fully functional accounting module

-- Account categories for organizing entries
CREATE TABLE public.account_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('revenue', 'expense', 'asset', 'liability', 'equity')),
  parent_category_id UUID REFERENCES public.account_categories(id),
  account_code TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Journal entries for accounting transactions
CREATE TABLE public.account_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  reference_number TEXT UNIQUE,
  category_id UUID REFERENCES public.account_categories(id),
  sub_category TEXT,
  amount NUMERIC(12,2) NOT NULL,
  debit_amount NUMERIC(12,2) DEFAULT 0,
  credit_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'reconciled', 'cancelled')),
  source_type TEXT CHECK (source_type IN ('manual', 'pos', 'booking', 'supplier', 'payroll')),
  source_id UUID,
  notes TEXT,
  posted_by TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Financial reports storage
CREATE TABLE public.financial_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('profit_loss', 'balance_sheet', 'cash_flow')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  generated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Budget planning
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  category_id UUID REFERENCES public.account_categories(id),
  budgeted_amount NUMERIC(12,2) NOT NULL,
  actual_amount NUMERIC(12,2) DEFAULT 0,
  period_type TEXT NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  period_number INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  variance NUMERIC(12,2) GENERATED ALWAYS AS (actual_amount - budgeted_amount) STORED,
  variance_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN budgeted_amount != 0 THEN ((actual_amount - budgeted_amount) / budgeted_amount) * 100
      ELSE 0
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.account_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now)
CREATE POLICY "Allow all operations on account_categories" ON public.account_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on account_entries" ON public.account_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on financial_reports" ON public.financial_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on budgets" ON public.budgets FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_account_categories_updated_at BEFORE UPDATE ON public.account_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_account_entries_updated_at BEFORE UPDATE ON public.account_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default account categories
INSERT INTO public.account_categories (name, type, account_code) VALUES
-- Revenue Categories
('Room Revenue', 'revenue', '4000'),
('Food & Beverage', 'revenue', '4100'),
('Other Services', 'revenue', '4200'),
('Laundry Services', 'revenue', '4300'),
('Spa Services', 'revenue', '4400'),
('Event Revenue', 'revenue', '4500'),

-- Expense Categories  
('Payroll', 'expense', '5000'),
('Utilities', 'expense', '5100'),
('Maintenance', 'expense', '5200'),
('Marketing', 'expense', '5300'),
('Administrative', 'expense', '5400'),
('Cost of Goods Sold', 'expense', '5500'),

-- Asset Categories
('Current Assets', 'asset', '1000'),
('Fixed Assets', 'asset', '1200'),
('Cash and Bank', 'asset', '1010'),
('Accounts Receivable', 'asset', '1020'),
('Inventory', 'asset', '1030'),
('Equipment', 'asset', '1210'),
('Buildings', 'asset', '1220'),

-- Liability Categories
('Current Liabilities', 'liability', '2000'),
('Long-term Debt', 'liability', '2200'),
('Accounts Payable', 'liability', '2010'),
('Accrued Expenses', 'liability', '2020'),

-- Equity Categories
('Owner Equity', 'equity', '3000'),
('Retained Earnings', 'equity', '3100');

-- Insert sample accounting entries for the current period
INSERT INTO public.account_entries (entry_date, description, reference_number, category_id, sub_category, amount, debit_amount, credit_amount, status, source_type) 
SELECT 
  CURRENT_DATE - INTERVAL '1 day' * (random() * 30)::int,
  CASE 
    WHEN ac.type = 'revenue' THEN 'Revenue from ' || ac.name
    WHEN ac.type = 'expense' THEN 'Payment for ' || ac.name
    ELSE 'Transaction for ' || ac.name
  END,
  'REF' || LPAD((ROW_NUMBER() OVER())::text, 6, '0'),
  ac.id,
  ac.name,
  CASE 
    WHEN ac.type = 'revenue' THEN (random() * 5000 + 1000)::numeric(12,2)
    WHEN ac.type = 'expense' THEN -(random() * 3000 + 500)::numeric(12,2)
    WHEN ac.type = 'asset' THEN (random() * 10000 + 5000)::numeric(12,2)
    WHEN ac.type = 'liability' THEN -(random() * 8000 + 2000)::numeric(12,2)
    ELSE (random() * 15000 + 10000)::numeric(12,2)
  END,
  CASE 
    WHEN ac.type IN ('asset', 'expense') THEN (random() * 5000 + 1000)::numeric(12,2)
    ELSE 0
  END,
  CASE 
    WHEN ac.type IN ('revenue', 'liability', 'equity') THEN (random() * 5000 + 1000)::numeric(12,2)
    ELSE 0
  END,
  'posted',
  'manual'
FROM public.account_categories ac 
WHERE ac.name IN ('Room Revenue', 'Food & Beverage', 'Payroll', 'Utilities', 'Marketing', 'Administrative')
LIMIT 15;

-- Insert sample budgets for current fiscal year
INSERT INTO public.budgets (name, fiscal_year, category_id, budgeted_amount, actual_amount, period_type, period_number)
SELECT 
  ac.name || ' Budget 2024',
  2024,
  ac.id,
  CASE 
    WHEN ac.type = 'revenue' THEN (random() * 20000 + 10000)::numeric(12,2)
    WHEN ac.type = 'expense' THEN (random() * 15000 + 5000)::numeric(12,2)
    ELSE 0
  END,
  CASE 
    WHEN ac.type = 'revenue' THEN (random() * 18000 + 8000)::numeric(12,2)
    WHEN ac.type = 'expense' THEN (random() * 13000 + 4000)::numeric(12,2)
    ELSE 0
  END,
  'monthly',
  1
FROM public.account_categories ac 
WHERE ac.type IN ('revenue', 'expense')
AND ac.name NOT LIKE '%Assets%'
AND ac.name NOT LIKE '%Liabilities%'
AND ac.name NOT LIKE '%Equity%';