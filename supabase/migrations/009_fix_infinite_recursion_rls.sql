-- ============================================
-- Fix Infinite Recursion in RLS Policies
-- ============================================
-- The issue: Admin policies query user_profiles to check admin role,
-- which triggers the same policies, causing infinite recursion.
-- Solution: Use a SECURITY DEFINER function to check admin status
-- ============================================

-- ============================================
-- STEP 1: Create helper function to check admin status
-- ============================================

-- Function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use SECURITY DEFINER to bypass RLS when checking admin status
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ============================================
-- STEP 2: Drop all existing admin policies
-- ============================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- ============================================
-- STEP 3: Recreate admin policies using the helper function
-- ============================================

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
-- STEP 4: Ensure user update policy is correct
-- ============================================

-- Drop and recreate user update policy to ensure it's correct
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- DONE!
-- ============================================
-- Now:
-- 1. No more infinite recursion - admin check uses SECURITY DEFINER
-- 2. Users can update their own profiles
-- 3. Admins can manage all profiles
-- ============================================

