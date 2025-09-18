-- Add hotel_icon field to hotel_settings table
ALTER TABLE public.hotel_settings 
ADD COLUMN hotel_icon text DEFAULT 'Hotel';