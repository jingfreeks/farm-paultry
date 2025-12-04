-- ============================================
-- COMPLETE DATABASE SETUP - CLEAN VERSION
-- Run this in your Supabase SQL Editor
-- This includes all necessary migrations in order
-- ============================================
-- IMPORTANT: Make sure you're copying the ENTIRE file
-- If you get syntax errors, clear the SQL Editor and paste fresh
-- ============================================

-- ============================================
-- STEP 0: Create helper function (from Migration 001)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 1: Create user_profiles table (Migration 004)
-- ============================================

-- Create user roles enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  role user_role DEFAULT 'customer',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (all fields except role and id)
-- Drop and recreate to ensure it's correct
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Helper function to check admin status (bypasses RLS to prevent recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use SECURITY DEFINER to bypass RLS when checking admin status
  -- Include both admin and staff roles
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (is_admin());

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (is_admin());

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (is_admin());

-- ============================================
-- STEP 1.5: Link customers table to user_profiles (before trigger)
-- ============================================

-- Add user_profile_id column to customers table (if it doesn't exist)
-- This must be done BEFORE creating the trigger function that uses it
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'user_profile_id'
    ) THEN
      ALTER TABLE customers ADD COLUMN user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_customers_user_profile_id ON customers(user_profile_id);
    END IF;
  END IF;
END $$;

-- ============================================
-- STEP 1.6: Function to create profile on user signup
-- ============================================
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
  -- Link it to user_profile using user_profile_id
  -- Only if customers table exists and email is not null
  IF user_email IS NOT NULL AND user_email != '' THEN
    BEGIN
      -- Check if user_profile_id column exists
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'user_profile_id'
      ) THEN
        -- Column exists, use it - ensure both email and user_profile_id are set
        INSERT INTO customers (email, full_name, user_profile_id)
        VALUES (user_email, user_full_name, NEW.id)
        ON CONFLICT (email) DO UPDATE
        SET 
          full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
          user_profile_id = COALESCE(EXCLUDED.user_profile_id, NEW.id, customers.user_profile_id),
          updated_at = NOW();
      ELSE
        -- Column doesn't exist yet, insert without it
        INSERT INTO customers (email, full_name)
        VALUES (user_email, user_full_name)
        ON CONFLICT (email) DO UPDATE
        SET 
          full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
          updated_at = NOW();
      END IF;
      
      -- Log success for debugging
      RAISE NOTICE 'Successfully created/updated customer record for email %', user_email;
    EXCEPTION WHEN OTHERS THEN
      -- Log detailed error for debugging
      RAISE WARNING 'Error creating customer record for email %: % (SQLSTATE: %)', user_email, SQLERRM, SQLSTATE;
      -- Try to get more details about the error
      RAISE WARNING 'Customer insert failed - email: %, full_name: %, user_id: %', user_email, user_full_name, NEW.id;
    END;
  ELSE
    RAISE WARNING 'Skipping customer creation - email is null or empty for user %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamp trigger (only fires when data actually changes)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- ============================================
-- STEP 2: Update existing email to customer role
-- ============================================

-- Update existing email to customer role (only if user_profiles exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    UPDATE user_profiles
    SET role = 'customer', updated_at = NOW()
    WHERE email = 'machinehead992003@yahoo.com';
  END IF;
END $$;

-- Ensure customer record exists for this email (only if customers table exists)
DO $$ 
DECLARE
  profile_id_val UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    -- Get the user_profile_id for this email
    SELECT id INTO profile_id_val FROM user_profiles WHERE email = 'machinehead992003@yahoo.com' LIMIT 1;
    
    -- Check if user_profile_id column exists before using it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'user_profile_id'
    ) THEN
      INSERT INTO customers (email, full_name, user_profile_id)
      VALUES ('machinehead992003@yahoo.com', NULL, profile_id_val)
      ON CONFLICT (email) DO UPDATE
      SET 
        user_profile_id = COALESCE(EXCLUDED.user_profile_id, customers.user_profile_id),
        updated_at = NOW();
    ELSE
      -- Fallback if column doesn't exist yet
      INSERT INTO customers (email, full_name)
      VALUES ('machinehead992003@yahoo.com', NULL)
      ON CONFLICT (email) DO UPDATE
      SET updated_at = NOW();
    END IF;
  END IF;
END $$;

-- ============================================
-- STEP 3: Update existing customers to link them to user_profiles
-- ============================================

-- Update existing customers to link them to user_profiles by email
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    UPDATE customers c
    SET user_profile_id = up.id
    FROM user_profiles up
    WHERE c.email = up.email 
      AND c.user_profile_id IS NULL
      AND up.role = 'customer';
  END IF;
END $$;

-- ============================================
-- STEP 4: Add customer RLS policies
-- ============================================

-- Drop existing customer policies if they exist
DROP POLICY IF EXISTS "Users can insert own customer" ON customers;
DROP POLICY IF EXISTS "Users can update own customer" ON customers;
DROP POLICY IF EXISTS "Users can view own customer" ON customers;

-- Allow users to insert their own customer record
CREATE POLICY "Users can insert own customer" ON customers
  FOR INSERT WITH CHECK (email = auth.jwt()->>'email');

-- Allow users to update their own customer record
CREATE POLICY "Users can update own customer" ON customers
  FOR UPDATE USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');

-- Allow users to view their own customer record
CREATE POLICY "Users can view own customer" ON customers
  FOR SELECT USING (email = auth.jwt()->>'email');

-- Note: The handle_new_user() trigger function uses SECURITY DEFINER
-- which bypasses RLS, so it can insert into customers without needing a policy

-- ============================================
-- STEP 5: Create profiles for existing users who don't have one
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
-- DONE! Your database is now set up.
-- ============================================
-- You can now:
-- 1. Sign up users - they'll automatically get profiles and customer records
-- 2. Access the profile page without errors
-- 3. Users can edit their own profiles
-- ============================================

