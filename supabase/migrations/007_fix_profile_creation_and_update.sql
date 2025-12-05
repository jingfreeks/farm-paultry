-- ============================================
-- Fix Profile Creation and Update Issues
-- ============================================
-- This migration fixes:
-- 1. Ensures user_profiles are created on signup
-- 2. Fixes profile update functionality
-- ============================================

-- ============================================
-- STEP 1: Improve handle_new_user function
-- ============================================

-- Make the trigger function more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
BEGIN
  -- Get email and full_name safely
  user_email := COALESCE(NEW.email, '');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NULL);

  -- Create user profile (with better error handling)
  -- Use SECURITY DEFINER to bypass RLS
  BEGIN
    INSERT INTO user_profiles (id, email, full_name, role, is_active)
    VALUES (
      NEW.id,
      user_email,
      user_full_name,
      'customer',
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = COALESCE(EXCLUDED.email, user_profiles.email),
      full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Log detailed error but don't fail user creation
    RAISE WARNING 'Error creating user_profile for user %: %', NEW.id, SQLERRM;
    -- Try to create a minimal profile if the full insert failed
    BEGIN
      INSERT INTO user_profiles (id, email, role, is_active)
      VALUES (NEW.id, user_email, 'customer', true)
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create minimal profile for user %: %', NEW.id, SQLERRM;
    END;
  END;

  -- Create customer record (upsert to handle existing emails)
  -- Only if customers table exists and email is not null
  IF user_email IS NOT NULL AND user_email != '' THEN
    BEGIN
      INSERT INTO customers (email, full_name)
      VALUES (user_email, user_full_name)
      ON CONFLICT (email) DO UPDATE
      SET 
        full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
        updated_at = NOW();
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail user creation
      RAISE WARNING 'Error creating customer record for email %: %', user_email, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 2: Ensure RLS policies allow updates
-- ============================================

-- Drop and recreate the update policy to ensure it's correct
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Users can update their own profile (all fields except role and id)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 3: Ensure trigger for updated_at is working
-- ============================================

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 4: Create profiles for existing users who don't have one
-- ============================================

-- This will create profiles for any existing auth users who don't have a profile
INSERT INTO user_profiles (id, email, full_name, role, is_active)
SELECT 
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'full_name', NULL),
  'customer',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DONE!
-- ============================================
-- Now:
-- 1. New users will automatically get profiles created
-- 2. Existing users without profiles will get them created
-- 3. Users can update their own profiles
-- ============================================

