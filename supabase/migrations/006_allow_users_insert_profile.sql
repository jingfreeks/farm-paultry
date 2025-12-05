-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

