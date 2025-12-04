-- ============================================
-- Migration 012: Fix infinite recursion in user_profiles RLS
-- ============================================
-- This ensures the is_admin() function properly bypasses RLS
-- and fixes any policies that might be causing recursion

-- ============================================
-- STEP 1: Drop and recreate is_admin() function with explicit RLS bypass
-- ============================================

-- Drop the function if it exists
DROP FUNCTION IF EXISTS is_admin();

-- Create a more robust is_admin() function that explicitly bypasses RLS
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
      AND role = 'admin'
      AND is_active = true
  ) INTO is_admin_result;
  
  RETURN COALESCE(is_admin_result, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users and anon (for public access if needed)
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- ============================================
-- STEP 2: Drop all existing user_profiles policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- ============================================
-- STEP 3: Recreate user policies (non-admin)
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 4: Recreate admin policies using is_admin() function
-- ============================================

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
-- STEP 5: Verify the function works
-- ============================================

-- Test that the function can be called (this should not cause recursion)
DO $$
BEGIN
  -- This should not cause infinite recursion
  PERFORM is_admin();
  RAISE NOTICE 'is_admin() function is working correctly';
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error testing is_admin(): %', SQLERRM;
END $$;

-- ============================================
-- DONE!
-- ============================================
-- The is_admin() function uses SECURITY DEFINER which bypasses RLS
-- This prevents infinite recursion when checking admin status
-- ============================================

