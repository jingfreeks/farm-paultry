-- Migration 018: Create avatar storage bucket and policies
-- This migration creates the storage bucket and policies for user avatars

-- IMPORTANT: Storage buckets cannot be created via SQL directly
-- You need to either:
-- 1. Use the Supabase Dashboard → Storage → New Bucket
-- 2. Use the setup script: node scripts/setup-avatar-bucket.js
-- 3. Use the Supabase Management API with service_role key

-- After creating the bucket manually, run the policies below:

-- Step 1: Create storage policies for the avatars bucket
-- These policies allow users to upload/update/delete only their own avatars
-- and allow public read access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;

-- Policy 1: Users can upload their own avatars
-- Only allows uploads to folders named with their user ID
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 2: Users can update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Users can delete their own avatars
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Public read access (so profile pictures can be viewed)
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Policy 5: Admins can upload company logos
CREATE POLICY "Admins can upload company logos" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'company' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'staff')
    )
  );

-- Policy 6: Admins can update company logos
CREATE POLICY "Admins can update company logos" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'company' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'company' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'staff')
    )
  );

-- Policy 7: Admins can delete company logos
CREATE POLICY "Admins can delete company logos" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'company' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'staff')
    )
  );

-- Instructions for creating the bucket via Dashboard:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: "avatars"
-- 4. Public: Yes (checked)
-- 5. File size limit: 5242880 (5MB)
-- 6. Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
-- 7. Click "Create bucket"
-- 8. Then run this migration to set up the policies

COMMENT ON SCHEMA public IS 'Avatar storage bucket setup. Create bucket via Dashboard first, then run this migration for policies.';

