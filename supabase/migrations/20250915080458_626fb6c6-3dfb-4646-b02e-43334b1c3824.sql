-- Create staff_votes table for monthly voting
CREATE TABLE public.staff_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  voter_name TEXT NOT NULL,
  voter_type TEXT NOT NULL CHECK (voter_type IN ('staff', 'guest')),
  voting_period TEXT NOT NULL, -- Format: YYYY-MM
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate votes from same person in same period
  UNIQUE(voter_name, voter_type, voting_period)
);

-- Enable Row Level Security
ALTER TABLE public.staff_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for staff_votes
CREATE POLICY "Anyone can view staff votes" 
ON public.staff_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can submit votes" 
ON public.staff_votes 
FOR INSERT 
WITH CHECK (true);

-- Update staff_recognition table to track monthly winners
ALTER TABLE public.staff_recognition 
ADD COLUMN IF NOT EXISTS total_votes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS voting_period TEXT;

-- Create index for better performance
CREATE INDEX idx_staff_votes_voting_period ON public.staff_votes(voting_period);
CREATE INDEX idx_staff_votes_employee_id ON public.staff_votes(employee_id);

-- Create function to update staff recognition winners
CREATE OR REPLACE FUNCTION public.update_monthly_winner()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to automatically update winners
  -- when voting period ends (to be called manually or via cron)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;