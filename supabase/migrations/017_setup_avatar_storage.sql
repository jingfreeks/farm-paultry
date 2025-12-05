-- Migration 017: Setup avatar storage bucket
-- This migration creates a storage bucket for user profile pictures

-- Create the avatars bucket (if it doesn't exist)
-- Note: Storage buckets are created via Supabase Dashboard or API
-- This SQL file documents the required setup

-- To set up the storage bucket manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: "avatars"
-- 4. Public: Yes (so profile pictures can be accessed)
-- 5. File size limit: 5MB (recommended)
-- 6. Allowed MIME types: image/*

-- Storage policies (set via Supabase Dashboard → Storage → Policies):
-- Policy 1: Users can upload their own avatars
--   Name: "Users can upload own avatar"
--   Target roles: authenticated
--   INSERT policy: (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
--   UPDATE policy: (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
--   DELETE policy: (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy 2: Anyone can view avatars (public read)
--   Name: "Public avatar access"
--   Target roles: anon, authenticated
--   SELECT policy: (bucket_id = 'avatars')

-- Alternative: Use SQL to create bucket (requires service_role key)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'avatars',
--   'avatars',
--   true,
--   5242880, -- 5MB in bytes
--   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
-- );

-- Create storage policies via SQL (requires service_role key)
-- Note: These policies allow users to upload/update/delete only their own avatars
-- and allow public read access

-- DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
-- CREATE POLICY "Users can upload own avatar" ON storage.objects
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     bucket_id = 'avatars' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
-- CREATE POLICY "Users can update own avatar" ON storage.objects
--   FOR UPDATE
--   TO authenticated
--   USING (
--     bucket_id = 'avatars' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   )
--   WITH CHECK (
--     bucket_id = 'avatars' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
-- CREATE POLICY "Users can delete own avatar" ON storage.objects
--   FOR DELETE
--   TO authenticated
--   USING (
--     bucket_id = 'avatars' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
-- CREATE POLICY "Public avatar access" ON storage.objects
--   FOR SELECT
--   TO public
--   USING (bucket_id = 'avatars');

COMMENT ON SCHEMA public IS 'Avatar storage bucket setup instructions. See comments above for manual setup steps.';

