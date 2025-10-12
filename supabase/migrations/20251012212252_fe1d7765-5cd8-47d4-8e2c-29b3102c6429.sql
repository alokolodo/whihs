-- Insert hotel rooms with correct column names
-- Floor 1: Rooms 101-108
-- Floor 2: Rooms 201-213

-- Rooms with 7000 rate (basic amenities - no AC, Fan, or Solar Power)
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

-- Remaining rooms on Floor 1 (default rate with full amenities)
INSERT INTO public.rooms (room_number, room_type, rate, status, floor_number, capacity, amenities) VALUES
('101', 'Standard', 10000, 'available', 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('102', 'Standard', 10000, 'available', 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power']),
('103', 'Standard', 10000, 'available', 1, 2, ARRAY['WiFi', 'Air Conditioning', 'Television', 'Reading Table & Chair', 'Fan', 'Solar Power'])
ON CONFLICT (room_number) DO NOTHING;

-- Remaining rooms on Floor 2 (default rate with full amenities)
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