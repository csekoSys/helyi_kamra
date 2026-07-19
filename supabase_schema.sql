-- HelyiKamra Supabase Database Schema
-- Run this in your Supabase SQL Editor.

-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Custom Types
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium');

-- 2. Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_buyer BOOLEAN NOT NULL DEFAULT true,
    is_producer BOOLEAN NOT NULL DEFAULT false,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    is_approved_by_admin BOOLEAN NOT NULL DEFAULT false,
    accepted_terms_at TIMESTAMP WITH TIME ZONE,
    accepted_gdpr_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Buyer Profiles Table
CREATE TABLE public.buyer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Producer Profiles Table
CREATE TABLE public.producer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    bio TEXT,
    phone TEXT,
    is_phone_public BOOLEAN NOT NULL DEFAULT false,
    subscription_tier public.subscription_tier NOT NULL DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL, -- e.g., 'kg', 'db', 'liter'
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    tags TEXT, -- Comma-separated list or simple text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Producer Locations Table
CREATE TABLE public.producer_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    location_type TEXT NOT NULL, -- e.g., 'farm', 'market', 'delivery_point'
    address TEXT NOT NULL,
    location geography(Point, 4326) NOT NULL,
    radius_km DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    delivery_text TEXT,
    schedule_info TEXT, -- Open hours / Delivery times
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Central Markets Table (Admin managed)
CREATE TABLE public.markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location geography(Point, 4326) NOT NULL,
    schedule TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Message Threads Table
CREATE TABLE public.message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.buyer_profiles(id) ON DELETE CASCADE,
    producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(buyer_id, producer_id)
);

-- 10. Messages Table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Blog Posts Table
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_sponsored BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Categories
INSERT INTO public.categories (name, icon_name) VALUES
('Zöldség', 'carrot'),
('Gyümölcs', 'apple'),
('Tejtermék', 'milk'),
('Hústermék', 'beef'),
('Pékáru', 'bread'),
('Méz', 'honey'),
('Tojás', 'egg'),
('Egyéb', 'shopping-basket')
ON CONFLICT (name) DO NOTHING;


-- 12. Profile Trigger on Auth User Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_is_buyer boolean;
  v_is_producer boolean;
  v_is_admin boolean;
  v_name text;
  v_phone text;
  v_farm_name text;
  v_accepted_terms boolean;
  v_accepted_gdpr boolean;
BEGIN
  -- Extract raw metadata fields, handle defaults
  v_is_buyer := COALESCE((new.raw_user_meta_data->>'isBuyer')::boolean, true);
  v_is_producer := COALESCE((new.raw_user_meta_data->>'isProducer')::boolean, false);
  v_is_admin := COALESCE((new.raw_user_meta_data->>'isAdmin')::boolean, false);
  
  v_name := COALESCE(new.raw_user_meta_data->>'name', 'Új Felhasználó');
  v_phone := COALESCE(new.raw_user_meta_data->>'phone', '');
  v_farm_name := COALESCE(new.raw_user_meta_data->>'farmName', 'Új Gazdaság');
  
  v_accepted_terms := COALESCE((new.raw_user_meta_data->>'acceptTerms')::boolean, false);
  v_accepted_gdpr := COALESCE((new.raw_user_meta_data->>'acceptGdpr')::boolean, false);

  -- Insert profile
  INSERT INTO public.profiles (
    id, 
    is_buyer, 
    is_producer, 
    is_admin, 
    is_approved_by_admin,
    accepted_terms_at,
    accepted_gdpr_at
  )
  VALUES (
    new.id,
    v_is_buyer,
    v_is_producer,
    v_is_admin,
    CASE 
      WHEN v_is_admin THEN true 
      WHEN v_is_producer THEN false -- producers require admin approval initially
      ELSE true -- buyers are auto-approved
    END,
    CASE WHEN v_accepted_terms THEN now() ELSE null END,
    CASE WHEN v_accepted_gdpr THEN now() ELSE null END
  );

  -- Insert sub-profiles
  IF v_is_producer THEN
    INSERT INTO public.producer_profiles (id, farm_name, bio, phone, is_phone_public, subscription_tier)
    VALUES (new.id, v_farm_name, '', v_phone, false, 'free');
  END IF;

  IF v_is_buyer THEN
    INSERT INTO public.buyer_profiles (id, name, phone)
    VALUES (new.id, v_name, v_phone);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution link
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 13. Distance-based GeoSearch RPC
CREATE OR REPLACE FUNCTION public.search_producers(
  p_lat double precision,
  p_lng double precision,
  p_max_distance_km double precision DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_query_text text DEFAULT NULL
)
RETURNS TABLE (
  producer_id uuid,
  farm_name text,
  bio text,
  address text,
  latitude double precision,
  longitude double precision,
  distance_km double precision,
  matching_products_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id AS producer_id,
    pp.farm_name,
    pp.bio,
    pl.address,
    ST_Y(pl.location::geometry) AS latitude,
    ST_X(pl.location::geometry) AS longitude,
    ST_Distance(
      pl.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1000.0 AS distance_km,
    (
      SELECT count(*) 
      FROM public.products p 
      WHERE p.producer_id = pp.id 
        AND p.is_active = true
        AND (p_category_id IS NULL OR p.category_id = p_category_id)
        AND (p_query_text IS NULL OR p.name ILIKE '%' || p_query_text || '%' OR p.description ILIKE '%' || p_query_text || '%')
    ) AS matching_products_count
  FROM 
    public.producer_profiles pp
  JOIN 
    public.producer_locations pl ON pl.producer_id = pp.id
  JOIN 
    public.profiles p_role ON p_role.id = pp.id
  WHERE 
    p_role.is_approved_by_admin = true
    AND (
      p_max_distance_km IS NULL OR 
      ST_Distance(
        pl.location,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
      ) / 1000.0 <= p_max_distance_km
    )
    AND (
      -- Show if no query/category, OR if matching products exist, OR if farm name/bio matches
      (p_category_id IS NULL AND p_query_text IS NULL) OR
      (
        SELECT count(*) 
        FROM public.products p 
        WHERE p.producer_id = pp.id 
          AND p.is_active = true
          AND (p_category_id IS NULL OR p.category_id = p_category_id)
          AND (p_query_text IS NULL OR p.name ILIKE '%' || p_query_text || '%' OR p.description ILIKE '%' || p_query_text || '%')
      ) > 0
      OR (p_query_text IS NOT NULL AND (pp.farm_name ILIKE '%' || p_query_text || '%' OR pp.bio ILIKE '%' || p_query_text || '%'))
    )
  ORDER BY 
    distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 13.5 Database Views for coordinates
CREATE OR REPLACE VIEW public.producer_locations_view AS
SELECT 
  id,
  producer_id,
  location_type,
  address,
  radius_km,
  delivery_text,
  schedule_info,
  ST_Y(location::geometry) AS latitude,
  ST_X(location::geometry) AS longitude,
  created_at
FROM 
  public.producer_locations;

CREATE OR REPLACE VIEW public.markets_view AS
SELECT
  id,
  name,
  address,
  schedule,
  ST_Y(location::geometry) AS latitude,
  ST_X(location::geometry) AS longitude,
  created_at
FROM
  public.markets;


-- 14. Row Level Security (RLS) Enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 15. RLS Policies

-- profiles
CREATE POLICY "Profiles readable by anyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles updateable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- buyer_profiles
CREATE POLICY "Buyer profiles readable by anyone" ON public.buyer_profiles FOR SELECT USING (true);
CREATE POLICY "Buyer profiles updateable by owner" ON public.buyer_profiles FOR UPDATE USING (auth.uid() = id);

-- producer_profiles
CREATE POLICY "Producer profiles readable by anyone" ON public.producer_profiles FOR SELECT USING (true);
CREATE POLICY "Producer profiles updateable by owner" ON public.producer_profiles FOR UPDATE USING (auth.uid() = id);

-- categories
CREATE POLICY "Categories readable by anyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories manageable by admin" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- products
CREATE POLICY "Products readable by anyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products manageable by producer owner" ON public.products FOR ALL USING (
  auth.uid() = producer_id
);

-- producer_locations
CREATE POLICY "Locations readable by anyone" ON public.producer_locations FOR SELECT USING (true);
CREATE POLICY "Locations manageable by producer owner" ON public.producer_locations FOR ALL USING (
  auth.uid() = producer_id
);

-- markets
CREATE POLICY "Markets readable by anyone" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Markets manageable by admin" ON public.markets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- message_threads
CREATE POLICY "Threads visible to participants" ON public.message_threads FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = producer_id
);
CREATE POLICY "Threads insertable by buyer" ON public.message_threads FOR INSERT WITH CHECK (
  auth.uid() = buyer_id
);

-- messages
CREATE POLICY "Messages visible to thread participants" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.message_threads t
    WHERE t.id = thread_id AND (t.buyer_id = auth.uid() OR t.producer_id = auth.uid())
  )
);
CREATE POLICY "Messages insertable by thread participants" ON public.messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.message_threads t
    WHERE t.id = thread_id AND (t.buyer_id = auth.uid() OR t.producer_id = auth.uid())
  )
);

-- blog_posts
CREATE POLICY "Blog posts readable by anyone" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Blog posts manageable by admin" ON public.blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
