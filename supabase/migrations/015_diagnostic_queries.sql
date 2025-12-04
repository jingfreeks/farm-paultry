-- ============================================
-- Migration 015: Diagnostic Queries
-- ============================================
-- Run these queries manually in Supabase SQL Editor to diagnose issues
-- ============================================

-- ============================================
-- Query 1: Check if user_profiles table exists and has data
-- ============================================
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff_count,
  COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_count
FROM user_profiles;

-- ============================================
-- Query 2: List all user profiles
-- ============================================
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- ============================================
-- Query 3: Check if is_admin() function works
-- ============================================
-- Note: This will return true/false based on the current logged-in user
SELECT is_admin() as current_user_is_admin;

-- ============================================
-- Query 4: Check RLS policies on user_profiles
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ============================================
-- Query 5: Check if customers table has data
-- ============================================
SELECT 
  COUNT(*) as total_customers,
  COUNT(CASE WHEN user_profile_id IS NOT NULL THEN 1 END) as linked_customers
FROM customers;

-- ============================================
-- Query 6: List customers with their linked profiles
-- ============================================
SELECT 
  c.id as customer_id,
  c.email as customer_email,
  c.full_name as customer_name,
  c.user_profile_id,
  up.id as profile_id,
  up.email as profile_email,
  up.role as profile_role
FROM customers c
LEFT JOIN user_profiles up ON c.user_profile_id = up.id OR c.email = up.email
ORDER BY c.created_at DESC;

-- ============================================
-- Query 7: Check current auth user and their profile
-- ============================================
-- This will show the currently authenticated user
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_user_email;

-- Get the profile for current user
SELECT 
  id,
  email,
  role,
  is_active
FROM user_profiles
WHERE id = auth.uid();

-- ============================================
-- Query 8: Test admin policy access
-- ============================================
-- This should return all profiles if you're an admin
-- If it returns 0 rows, the RLS policy might be blocking
SELECT COUNT(*) as accessible_profiles
FROM user_profiles;

-- ============================================
-- Query 9: Check trigger exists
-- ============================================
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- ============================================
-- Query 10: Manual fix - Create customer records for existing profiles
-- ============================================
-- Run this if customers are missing for existing profiles
DO $$
DECLARE
  profile_record RECORD;
  customer_exists BOOLEAN;
  user_profile_id_exists BOOLEAN;
BEGIN
  -- Check if user_profile_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'user_profile_id'
  ) INTO user_profile_id_exists;

  -- Loop through all profiles
  FOR profile_record IN 
    SELECT id, email, full_name 
    FROM user_profiles
  LOOP
    -- Check if customer record already exists for this email
    SELECT EXISTS (
      SELECT 1 FROM customers WHERE email = profile_record.email
    ) INTO customer_exists;

    -- If customer doesn't exist, create it
    IF NOT customer_exists THEN
      BEGIN
        IF user_profile_id_exists THEN
          INSERT INTO customers (email, full_name, user_profile_id)
          VALUES (profile_record.email, profile_record.full_name, profile_record.id)
          ON CONFLICT (email) DO UPDATE
          SET 
            full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
            user_profile_id = COALESCE(EXCLUDED.user_profile_id, profile_record.id, customers.user_profile_id),
            updated_at = NOW();
        ELSE
          INSERT INTO customers (email, full_name)
          VALUES (profile_record.email, profile_record.full_name)
          ON CONFLICT (email) DO UPDATE
          SET 
            full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
            updated_at = NOW();
        END IF;
        
        RAISE NOTICE 'Created customer record for email: %', profile_record.email;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create customer record for email %: %', profile_record.email, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- DONE!
-- ============================================
-- Run these queries to diagnose:
-- 1. Check if data exists (Query 1, 2)
-- 2. Check if RLS policies are correct (Query 4)
-- 3. Check if is_admin() works (Query 3)
-- 4. Check if you're logged in (Query 7)
-- 5. Test admin access (Query 8)
-- 6. Fix missing customers (Query 10)
-- ============================================

