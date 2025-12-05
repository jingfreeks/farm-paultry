/**
 * Setup script to create the avatars storage bucket in Supabase
 * 
 * This script requires the SUPABASE_SERVICE_ROLE_KEY environment variable
 * which can be found in Supabase Dashboard → Settings → API → service_role key
 * 
 * Usage:
 * 1. Create a .env.local file with:
 *    SUPABASE_URL=your_supabase_project_url
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 * 
 * 2. Run: node scripts/setup-avatar-bucket.js
 * 
 * Or use npx with environment variables:
 * SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/setup-avatar-bucket.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is required');
  console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupAvatarBucket() {
  console.log('🚀 Setting up avatars storage bucket...\n');

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      process.exit(1);
    }

    const avatarsBucket = buckets?.find(b => b.id === 'avatars');

    if (avatarsBucket) {
      console.log('✅ Bucket "avatars" already exists!');
      console.log('   Public:', avatarsBucket.public);
      console.log('   Created:', avatarsBucket.created_at);
      return;
    }

    // Create the bucket
    console.log('📦 Creating "avatars" bucket...');
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    });

    if (error) {
      console.error('❌ Error creating bucket:', error.message);
      process.exit(1);
    }

    console.log('✅ Bucket "avatars" created successfully!');

    // Set up storage policies
    console.log('\n📋 Setting up storage policies...');

    // Note: Storage policies need to be set via SQL or Dashboard
    // We'll provide SQL commands to run
    console.log('\n⚠️  Storage policies need to be set up manually.');
    console.log('   Run the following SQL in Supabase Dashboard → SQL Editor:\n');
    
    console.log(`
-- Policy 1: Users can upload their own avatars
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

-- Policy 4: Public read access
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
    `);

    console.log('\n✅ Setup complete!');
    console.log('   Don\'t forget to run the SQL policies above in Supabase Dashboard → SQL Editor');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

setupAvatarBucket();

