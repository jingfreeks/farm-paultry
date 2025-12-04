-- ============================================
-- Migration 016: Fix RLS for admin customers query
-- ============================================
-- This migration ensures admins can query all user_profiles
-- by fixing the RLS policies and testing the is_admin() function

-- ============================================
-- STEP 1: Ensure is_admin() function exists and works
-- ============================================

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
GRANT EXECUTE ON FUNCTION is_admin() TO public;

-- ============================================
-- STEP 2: Drop and recreate admin policies with explicit checks
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Recreate user policies first (non-admin)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Recreate admin policies (must come after user policies)
-- These use is_admin() which bypasses RLS
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (is_admin() = true);

CREATE POLICY "Admins can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (is_admin() = true);

CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (is_admin() = true) WITH CHECK (is_admin() = true);

CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (is_admin() = true);

-- ============================================
-- STEP 3: Test the policies
-- ============================================

-- This should work for admins
-- Run this while logged in as admin to test:
-- SELECT COUNT(*) FROM user_profiles;

-- ============================================
-- STEP 4: Create a helper function to get all profiles (for admins)
-- ============================================

-- This function can be called via RPC to bypass potential RLS issues
CREATE OR REPLACE FUNCTION get_all_user_profiles()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  full_name VARCHAR,
  phone VARCHAR,
  role user_role,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Return all profiles
  RETURN QUERY
  SELECT 
    up.id,
    up.email,
    up.full_name,
    up.phone,
    up.role,
    up.is_active,
    up.created_at,
    up.updated_at
  FROM user_profiles up
  ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_all_user_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_user_profiles() TO anon;

-- ============================================
-- DONE!
-- ============================================
-- Now:
-- 1. is_admin() function is properly set up
-- 2. RLS policies are recreated with explicit checks
-- 3. A helper function get_all_user_profiles() is available as fallback
-- 4. Admins should be able to query all user_profiles
-- ============================================

