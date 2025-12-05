-- ============================================
-- Migration 010: Link customers table to user_profiles
-- ============================================
-- This migration establishes a relationship between customers and user_profiles
-- ============================================

-- Step 1: Add user_profile_id column to customers table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'user_profile_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 2: Create index on user_profile_id for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_profile_id ON customers(user_profile_id);

-- Step 3: Update existing customers to link them to user_profiles by email
-- This matches customers to user_profiles based on email
UPDATE customers c
SET user_profile_id = up.id
FROM user_profiles up
WHERE c.email = up.email 
  AND c.user_profile_id IS NULL
  AND up.role = 'customer';

-- Step 4: Update handle_new_user trigger to link customer to user_profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
  user_profile_id_val UUID;
BEGIN
  -- Get email and full_name safely
  user_email := COALESCE(NEW.email, '');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NULL);

  -- Create user profile (with better error handling)
  -- Use SECURITY DEFINER to bypass RLS
  BEGIN
    INSERT INTO user_profiles (id, email, full_name, role, is_active)
    VALUES (
      NEW.id,
      user_email,
      user_full_name,
      'customer',
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = COALESCE(EXCLUDED.email, user_profiles.email),
      full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
      updated_at = NOW()
    RETURNING id INTO user_profile_id_val;
  EXCEPTION WHEN OTHERS THEN
    -- Log detailed error but don't fail user creation
    RAISE WARNING 'Error creating user_profile for user %: %', NEW.id, SQLERRM;
    -- Try to create a minimal profile if the full insert failed
    BEGIN
      INSERT INTO user_profiles (id, email, role, is_active)
      VALUES (NEW.id, user_email, 'customer', true)
      ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
      RETURNING id INTO user_profile_id_val;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create minimal profile for user %: %', NEW.id, SQLERRM;
      user_profile_id_val := NEW.id; -- Use user id as fallback
    END;
  END;

  -- Create customer record (upsert to handle existing emails)
  -- Link it to user_profile using user_profile_id
  -- Only if customers table exists and email is not null
  IF user_email IS NOT NULL AND user_email != '' THEN
    BEGIN
      INSERT INTO customers (email, full_name, user_profile_id)
      VALUES (user_email, user_full_name, user_profile_id_val)
      ON CONFLICT (email) DO UPDATE
      SET 
        full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
        user_profile_id = COALESCE(EXCLUDED.user_profile_id, customers.user_profile_id),
        updated_at = NOW();
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail user creation
      RAISE WARNING 'Error creating customer record for email %: %', user_email, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Add comment to document the relationship
COMMENT ON COLUMN customers.user_profile_id IS 'References user_profiles.id - links customer record to user profile';

