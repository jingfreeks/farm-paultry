# Migration Guide

This guide will help you run the database migrations in your Supabase project.

## ⚠️ IMPORTANT: If `user_profiles` table doesn't exist

If you get an error that `user_profiles` doesn't exist, you need to run the complete setup first. Use the **COMPLETE_SETUP.sql** file which creates everything you need.

## Prerequisites

1. A Supabase project created at [supabase.com](https://supabase.com)
2. Access to your Supabase dashboard
3. Your project URL and anon key (found in Settings → API)

## Step-by-Step Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New query**

3. **Run Migration 005: Link Signup to Customers**
   - Copy the contents of `supabase/migrations/005_link_signup_to_customers.sql`
   - Paste it into the SQL Editor
   - Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
   - Wait for "Success. No rows returned" message

4. **Run Migration 006: Allow Users to Insert Profile**
   - Copy the contents of `supabase/migrations/006_allow_users_insert_profile.sql`
   - Paste it into the SQL Editor
   - Click **Run**
   - Wait for "Success. No rows returned" message

### Option 2: Run Combined Migration (Easier)

You can run both migrations at once:

1. **Open SQL Editor** in Supabase Dashboard
2. **Copy and paste the combined migration below**
3. **Click Run**

```sql
-- ============================================
-- MIGRATION 005: Link Signup to Customers
-- ============================================

-- Update handle_new_user function to also create customer record
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'customer' -- Default role is customer
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    updated_at = NOW();

  -- Create customer record (upsert to handle existing emails)
  INSERT INTO customers (email, full_name)
  VALUES (
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing email to customer role
UPDATE user_profiles
SET role = 'customer', updated_at = NOW()
WHERE email = 'machinehead992003@yahoo.com';

-- Ensure customer record exists for this email
INSERT INTO customers (email, full_name)
VALUES ('machinehead992003@yahoo.com', NULL)
ON CONFLICT (email) DO UPDATE
SET updated_at = NOW();

-- Allow users to insert their own customer record
CREATE POLICY "Users can insert own customer" ON customers
  FOR INSERT WITH CHECK (email = auth.jwt()->>'email');

-- Allow users to update their own customer record
CREATE POLICY "Users can update own customer" ON customers
  FOR UPDATE USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');

-- Allow users to view their own customer record
CREATE POLICY "Users can view own customer" ON customers
  FOR SELECT USING (email = auth.jwt()->>'email');

-- ============================================
-- MIGRATION 006: Allow Users to Insert Profile
-- ============================================

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Verify Migrations

After running the migrations, verify they worked:

1. **Check Policies**
   - Go to **Authentication** → **Policies** (or **Database** → **Tables** → `user_profiles` → **Policies`)
   - You should see "Users can insert own profile" policy

2. **Test Profile Creation**
   - Try signing up a new user
   - Check if a customer record is created automatically
   - Try accessing the profile page

## Troubleshooting

### Error: "policy already exists"
- This means the policy was already created
- You can safely ignore this or drop and recreate:
  ```sql
  DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
  ```

### Error: "function already exists"
- The trigger function already exists
- This is fine - the `CREATE OR REPLACE` will update it

### Error: "relation does not exist"
- Make sure you've run the earlier migrations first:
  - `001_initial_schema.sql`
  - `004_users_and_roles.sql`

## Migration Order

If you haven't run all migrations yet, run them in this order:

1. `001_initial_schema.sql` - Creates tables
2. `002_seed_data.sql` - Adds sample data (optional)
3. `003_checkout_rls_policies.sql` - Checkout policies
4. `004_users_and_roles.sql` - User profiles table
5. `005_link_signup_to_customers.sql` - Link signup to customers
6. `006_allow_users_insert_profile.sql` - Allow profile insertion

## Need Help?

If you encounter any issues:
1. Check the error message in Supabase SQL Editor
2. Verify your database schema matches the migrations
3. Make sure RLS is enabled on the tables

