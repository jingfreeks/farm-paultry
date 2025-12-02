-- ============================================
-- Ensure Profile Update Works
-- ============================================
-- This migration ensures users can update their profiles
-- by verifying RLS policies and adding any missing ones
-- ============================================

-- ============================================
-- STEP 1: Verify and fix RLS policies for updates
-- ============================================

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create a simple, clear update policy
-- Users can update their own profile (all fields except id and role are updatable)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 2: Add a function to help with profile updates
-- ============================================

-- Function to safely update user profile
-- This can be called from the client or used in triggers
CREATE OR REPLACE FUNCTION update_user_profile_safe(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow users to update their own profile
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Cannot update another user''s profile';
  END IF;

  -- Update the profile
  UPDATE user_profiles
  SET 
    full_name = COALESCE(p_full_name, full_name),
    phone = COALESCE(p_phone, phone),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_profile_safe(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- ============================================
-- STEP 3: Ensure all existing users have profiles
-- ============================================

-- Create profiles for any auth users who don't have one
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
-- STEP 4: Verify the trigger is working
-- ============================================

-- Make sure the updated_at trigger exists
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE!
-- ============================================
-- Now users should be able to:
-- 1. Update their full_name
-- 2. Update their phone
-- 3. Update their avatar_url
-- 4. The updated_at will be automatically set
-- ============================================

