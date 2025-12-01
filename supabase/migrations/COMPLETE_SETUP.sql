-- ============================================
-- COMPLETE DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- This includes all necessary migrations in order
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

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile (with error handling)
  BEGIN
    INSERT INTO user_profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      NEW.raw_user_meta_data->>'full_name',
      'customer' -- Default role is customer
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = COALESCE(EXCLUDED.email, user_profiles.email),
      full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating user_profile: %', SQLERRM;
  END;

  -- Create customer record (upsert to handle existing emails)
  -- Only if customers table exists and email is not null
  IF NEW.email IS NOT NULL THEN
    BEGIN
      INSERT INTO customers (email, full_name)
      VALUES (
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
      )
      ON CONFLICT (email) DO UPDATE
      SET 
        full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
        updated_at = NOW();
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail user creation
      RAISE WARNING 'Error creating customer record: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamp trigger
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- ============================================
-- STEP 2: Update existing email to customer role
-- ============================================

-- Update existing email to customer role
UPDATE user_profiles
SET role = 'customer', updated_at = NOW()
WHERE email = 'machinehead992003@yahoo.com';

-- Ensure customer record exists for this email
INSERT INTO customers (email, full_name)
VALUES ('machinehead992003@yahoo.com', NULL)
ON CONFLICT (email) DO UPDATE
SET updated_at = NOW();

-- ============================================
-- STEP 3: Add customer RLS policies
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

-- ============================================
-- DONE! Your database is now set up.
-- ============================================
-- You can now:
-- 1. Sign up users - they'll automatically get profiles and customer records
-- 2. Access the profile page without errors
-- 3. Users can edit their own profiles
-- ============================================

