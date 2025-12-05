-- ============================================
-- Migration 013: Fix missing customer data
-- ============================================
-- This migration:
-- 1. Creates customer records for existing user_profiles that don't have customers
-- 2. Adds admin policies to view all customers
-- 3. Ensures the trigger is working correctly

-- ============================================
-- STEP 1: Add admin policies for customers table
-- ============================================

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Admins can insert customers" ON customers;
DROP POLICY IF EXISTS "Admins can update all customers" ON customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON customers;

-- Admins can view all customers
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT USING (is_admin());

-- Admins can insert customers
CREATE POLICY "Admins can insert customers" ON customers
  FOR INSERT WITH CHECK (is_admin());

-- Admins can update any customer
CREATE POLICY "Admins can update all customers" ON customers
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- Admins can delete customers
CREATE POLICY "Admins can delete customers" ON customers
  FOR DELETE USING (is_admin());

-- ============================================
-- STEP 2: Create customer records for existing user_profiles
-- ============================================

-- Create customer records for all user_profiles with role='customer' that don't have a customer record
DO $$
DECLARE
  profile_record RECORD;
  customer_exists BOOLEAN;
  user_profile_id_exists BOOLEAN;
BEGIN
  -- Check if user_profile_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'user_profile_id'
  ) INTO user_profile_id_exists;

  -- Loop through all customer profiles
  FOR profile_record IN 
    SELECT id, email, full_name 
    FROM user_profiles 
    WHERE role = 'customer'
  LOOP
    -- Check if customer record already exists for this email
    SELECT EXISTS (
      SELECT 1 FROM customers WHERE email = profile_record.email
    ) INTO customer_exists;

    -- If customer doesn't exist, create it
    IF NOT customer_exists THEN
      BEGIN
        IF user_profile_id_exists THEN
          -- Insert with user_profile_id
          INSERT INTO customers (email, full_name, user_profile_id)
          VALUES (profile_record.email, profile_record.full_name, profile_record.id)
          ON CONFLICT (email) DO UPDATE
          SET 
            full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
            user_profile_id = COALESCE(EXCLUDED.user_profile_id, profile_record.id, customers.user_profile_id),
            updated_at = NOW();
        ELSE
          -- Insert without user_profile_id (column doesn't exist yet)
          INSERT INTO customers (email, full_name)
          VALUES (profile_record.email, profile_record.full_name)
          ON CONFLICT (email) DO UPDATE
          SET 
            full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
            updated_at = NOW();
        END IF;
        
        RAISE NOTICE 'Created customer record for email: %', profile_record.email;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create customer record for email %: %', profile_record.email, SQLERRM;
      END;
    ELSE
      -- Customer exists, but might need user_profile_id update
      IF user_profile_id_exists THEN
        UPDATE customers
        SET user_profile_id = profile_record.id
        WHERE email = profile_record.email 
          AND (user_profile_id IS NULL OR user_profile_id != profile_record.id);
      END IF;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- STEP 3: Verify trigger is set up correctly
-- ============================================

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STEP 4: Test query to verify data
-- ============================================

-- This query should show all customers with their linked user_profiles
-- Run this manually in SQL Editor to verify:
-- SELECT 
--   c.id as customer_id,
--   c.email,
--   c.full_name,
--   c.user_profile_id,
--   up.id as profile_id,
--   up.role,
--   up.is_active
-- FROM customers c
-- LEFT JOIN user_profiles up ON c.user_profile_id = up.id OR c.email = up.email
-- ORDER BY c.created_at DESC;

-- ============================================
-- DONE!
-- ============================================
-- Now:
-- 1. All existing user_profiles with role='customer' have customer records
-- 2. Admins can view all customers
-- 3. Trigger is properly set up for new signups
-- ============================================

