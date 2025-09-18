-- Create hotel settings table
CREATE TABLE public.hotel_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_name TEXT NOT NULL DEFAULT 'My Hotel',
  hotel_address TEXT,
  hotel_phone TEXT,
  hotel_whatsapp TEXT,
  hotel_email TEXT,
  hotel_website TEXT,
  hotel_description TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  language TEXT NOT NULL DEFAULT 'en',
  tax_rate NUMERIC DEFAULT 7.5,
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/dd/yyyy',
  time_format TEXT DEFAULT '12h',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  desktop_notifications BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  payment_gateways JSONB DEFAULT '{"paystack": true, "flutterwave": true, "stripe": true, "paypal": false, "razorpay": false, "mobileMoney": true}',
  two_factor_enabled BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on hotel_settings" 
ON public.hotel_settings 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hotel_settings_updated_at
BEFORE UPDATE ON public.hotel_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.hotel_settings (hotel_name) VALUES ('My Hotel');