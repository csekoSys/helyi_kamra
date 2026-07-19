-- 1. Add new columns
ALTER TABLE public.profiles 
  ADD COLUMN is_buyer BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN is_producer BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN accepted_terms_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN accepted_gdpr_at TIMESTAMP WITH TIME ZONE;

-- 2. Migrate existing data (if any)
UPDATE public.profiles SET is_buyer = (role = 'buyer' OR role = 'producer');
UPDATE public.profiles SET is_producer = (role = 'producer');
UPDATE public.profiles SET is_admin = (role = 'admin');

-- 3. Update Policies
-- We need to drop old policies that use role = 'admin' and recreate them.
-- Categories
DROP POLICY IF EXISTS "Categories manageable by admin" ON public.categories;
CREATE POLICY "Categories manageable by admin" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Markets
DROP POLICY IF EXISTS "Markets manageable by admin" ON public.markets;
CREATE POLICY "Markets manageable by admin" ON public.markets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Blog posts
DROP POLICY IF EXISTS "Blog posts manageable by admin" ON public.blog_posts;
CREATE POLICY "Blog posts manageable by admin" ON public.blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 4. Update the trigger function
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

-- 5. Drop role column and enum
ALTER TABLE public.profiles DROP COLUMN role;
DROP TYPE IF EXISTS public.user_role;
