# Avatar Storage Bucket Setup

The profile picture upload feature requires a Supabase storage bucket named `avatars`. Follow these steps to set it up:

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Configure the bucket:
   - **Name**: `avatars`
   - **Public**: ✅ Yes (checked) - This allows profile pictures to be viewed
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`
4. Click **"Create bucket"**

5. Set up storage policies:
   - Go to **Storage** → **Policies** → Select `avatars` bucket
   - Or run the SQL in `supabase/migrations/018_create_avatar_bucket_and_policies.sql` in the SQL Editor

## Option 2: Using Setup Script

1. Install dependencies (if not already installed):
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. Get your service role key:
   - Go to **Supabase Dashboard** → **Settings** → **API**
   - Copy the **service_role key** (⚠️ Keep this secret!)

3. Create or update `.env.local`:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Run the setup script:
   ```bash
   node scripts/setup-avatar-bucket.js
   ```

5. Run the SQL policies:
   - Go to **Supabase Dashboard** → **SQL Editor**
   - Run `supabase/migrations/018_create_avatar_bucket_and_policies.sql`

## Option 3: Manual SQL Setup

1. Create the bucket via Dashboard (see Option 1, steps 1-4)

2. Run the policies SQL:
   - Go to **Supabase Dashboard** → **SQL Editor**
   - Copy and run the SQL from `supabase/migrations/018_create_avatar_bucket_and_policies.sql`

## Verify Setup

After setup, you should be able to:
- Upload profile pictures from the profile page
- See uploaded images displayed
- Remove profile pictures

If you get a "Bucket not found" error, make sure:
1. The bucket name is exactly `avatars` (lowercase)
2. The bucket is set to **Public**
3. The storage policies are set up correctly

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket exists and is named `avatars`
- Check that it's set to Public
- Verify in Supabase Dashboard → Storage

### "Permission denied" error
- Make sure the storage policies are set up
- Run the SQL from migration `018_create_avatar_bucket_and_policies.sql`

### Images not displaying
- Check that the bucket is set to **Public**
- Verify the `avatar_url` in the `user_profiles` table
- Check browser console for CORS or loading errors

