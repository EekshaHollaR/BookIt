-- Create experiences table
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  border_color TEXT,
  badge_text TEXT,
  badge_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create time_slots table
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  total_capacity INTEGER NOT NULL DEFAULT 50,
  available INTEGER NOT NULL DEFAULT 50,
  sold_out BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(experience_id, date, time)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT UNIQUE NOT NULL,
  experience_id UUID REFERENCES public.experiences(id) NOT NULL,
  experience_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  price INTEGER NOT NULL,
  taxes INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required for booking app)
CREATE POLICY "Public read access for experiences"
ON public.experiences FOR SELECT
USING (true);

CREATE POLICY "Public read access for time_slots"
ON public.time_slots FOR SELECT
USING (true);

CREATE POLICY "Public read access for bookings"
ON public.bookings FOR SELECT
USING (true);

CREATE POLICY "Public insert access for bookings"
ON public.bookings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for time_slots"
ON public.time_slots FOR UPDATE
USING (true);

CREATE POLICY "Public read access for promo_codes"
ON public.promo_codes FOR SELECT
USING (true);

-- Insert sample promo codes
INSERT INTO public.promo_codes (code, discount, active) VALUES
('SAVE10', 10, true),
('FLAT100', 100, true);