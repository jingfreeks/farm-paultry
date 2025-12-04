-- ============================================
-- Migration 014: Ensure admins can view all user profiles
-- ============================================
-- This migration ensures that admin policies are correctly set up
-- so admins can view all user profiles in the customers page

-- ============================================
-- STEP 1: Verify is_admin() function exists and works
-- ============================================

-- Ensure is_admin() function exists
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  is_admin_result BOOLEAN;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  -- If no user is authenticated, return false
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Use SECURITY DEFINER to bypass RLS when checking admin status
  -- Query directly from user_profiles without triggering RLS
  SELECT EXISTS (
    SELECT 1 
    FROM user_profiles
    WHERE id = user_id 
      AND (role = 'admin' OR role = 'staff')
      AND is_active = true
  ) INTO is_admin_result;
  
  RETURN COALESCE(is_admin_result, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users and anon
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- ============================================
-- STEP 2: Ensure admin policies exist for user_profiles
-- ============================================

-- Drop and recreate admin policies to ensure they're correct
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- Admins can view all profiles (using is_admin() which bypasses RLS)
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (is_admin());

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (is_admin());

-- ============================================
-- STEP 3: Ensure admin policies exist for customers
-- ============================================

-- Drop and recreate admin policies for customers
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Admins can insert customers" ON customers;
DROP POLICY IF EXISTS "Admins can update all customers" ON customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON customers;

-- Admins can view all customers
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT USING (is_admin());

-- Admins can insert customers
CREATE POLICY "Admins can insert customers" ON customers
  FOR INSERT WITH CHECK (is_admin());

-- Admins can update any customer
CREATE POLICY "Admins can update all customers" ON customers
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- Admins can delete customers
CREATE POLICY "Admins can delete customers" ON customers
  FOR DELETE USING (is_admin());

-- ============================================
-- STEP 4: Test query (for manual verification)
-- ============================================

-- This query should return all user profiles when run by an admin
-- Run this manually in SQL Editor while logged in as admin to verify:
-- SELECT id, email, full_name, role, is_active, created_at 
-- FROM user_profiles 
-- ORDER BY created_at DESC;

-- ============================================
-- DONE!
-- ============================================
-- Now admins should be able to:
-- 1. View all user profiles (not just customers)
-- 2. View all customer records
-- 3. The admin customers page should show all users
-- ============================================

