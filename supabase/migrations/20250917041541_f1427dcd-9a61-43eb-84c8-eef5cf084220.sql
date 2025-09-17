-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  room_type TEXT NOT NULL DEFAULT 'standard',
  rate NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  capacity INTEGER NOT NULL DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  floor_number INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room bookings table for check-ins
CREATE TABLE public.room_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_out_date DATE NOT NULL,
  nights INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'paid',
  booking_status TEXT NOT NULL DEFAULT 'active',
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on rooms" 
ON public.rooms 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on room_bookings" 
ON public.room_bookings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update room status after booking
CREATE OR REPLACE FUNCTION public.update_room_status_after_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update room status to occupied when booking is active
    IF NEW.booking_status = 'active' AND NEW.payment_status = 'paid' THEN
        UPDATE public.rooms 
        SET status = 'occupied', updated_at = now()
        WHERE id = NEW.room_id;
    END IF;
    
    -- Update room status to available when booking ends
    IF NEW.booking_status = 'completed' OR NEW.booking_status = 'cancelled' THEN
        UPDATE public.rooms 
        SET status = 'available', updated_at = now()
        WHERE id = NEW.room_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for room status updates
CREATE TRIGGER update_room_status_trigger
    AFTER INSERT OR UPDATE ON public.room_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_room_status_after_booking();

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_bookings_updated_at
    BEFORE UPDATE ON public.room_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample rooms
INSERT INTO public.rooms (room_number, room_type, rate, status, capacity, amenities, floor_number, description) VALUES
('101', 'standard', 120.00, 'available', 2, '{"WiFi", "TV", "Air Conditioning"}', 1, 'Comfortable standard room with city view'),
('102', 'standard', 120.00, 'available', 2, '{"WiFi", "TV", "Air Conditioning"}', 1, 'Comfortable standard room with city view'),
('201', 'deluxe', 180.00, 'available', 3, '{"WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony"}', 2, 'Spacious deluxe room with balcony'),
('202', 'deluxe', 180.00, 'available', 3, '{"WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony"}', 2, 'Spacious deluxe room with balcony'),
('301', 'suite', 300.00, 'available', 4, '{"WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Jacuzzi", "Kitchen"}', 3, 'Luxury suite with all amenities');