-- ============================================
-- Migration 011: Fix customer creation on signup
-- ============================================
-- This migration ensures customer records are created on signup
-- by improving the trigger function and adding a service role policy

-- Update handle_new_user function with better error handling and logging
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
BEGIN
  -- Get email and full_name safely
  user_email := COALESCE(NEW.email, '');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NULL);

  -- Create user profile (with better error handling)
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
      updated_at = NOW();
    
    RAISE NOTICE 'Successfully created/updated user_profile for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating user_profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    -- Try to create a minimal profile if the full insert failed
    BEGIN
      INSERT INTO user_profiles (id, email, role, is_active)
      VALUES (NEW.id, user_email, 'customer', true)
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create minimal profile for user %: %', NEW.id, SQLERRM;
    END;
  END;

  -- Create customer record (upsert to handle existing emails)
  -- Link it to user_profile using user_profile_id
  -- Only if customers table exists and email is not null
  IF user_email IS NOT NULL AND user_email != '' THEN
    BEGIN
      -- Check if user_profile_id column exists
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'user_profile_id'
      ) THEN
        -- Column exists, use it - ensure both email and user_profile_id are set
        INSERT INTO customers (email, full_name, user_profile_id)
        VALUES (user_email, user_full_name, NEW.id)
        ON CONFLICT (email) DO UPDATE
        SET 
          full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
          user_profile_id = COALESCE(EXCLUDED.user_profile_id, NEW.id, customers.user_profile_id),
          updated_at = NOW();
      ELSE
        -- Column doesn't exist yet, insert without it
        INSERT INTO customers (email, full_name)
        VALUES (user_email, user_full_name)
        ON CONFLICT (email) DO UPDATE
        SET 
          full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
          updated_at = NOW();
      END IF;
      
      RAISE NOTICE 'Successfully created/updated customer record for email %', user_email;
    EXCEPTION WHEN OTHERS THEN
      -- Log detailed error for debugging
      RAISE WARNING 'Error creating customer record for email %: % (SQLSTATE: %)', user_email, SQLERRM, SQLSTATE;
      RAISE WARNING 'Customer insert failed - email: %, full_name: %, user_id: %', user_email, user_full_name, NEW.id;
    END;
  ELSE
    RAISE WARNING 'Skipping customer creation - email is null or empty for user %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: SECURITY DEFINER functions bypass RLS, so no additional policy is needed
-- The trigger function can insert into customers without RLS restrictions

-- Ensure the trigger exists and is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

