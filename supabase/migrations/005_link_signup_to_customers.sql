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

-- Allow users to insert their own customer record (for edge cases)
-- Note: The trigger handles most cases, but this allows manual inserts if needed
CREATE POLICY "Users can insert own customer" ON customers
  FOR INSERT WITH CHECK (email = auth.jwt()->>'email');

-- Allow users to update their own customer record
CREATE POLICY "Users can update own customer" ON customers
  FOR UPDATE USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');

-- Allow users to view their own customer record
CREATE POLICY "Users can view own customer" ON customers
  FOR SELECT USING (email = auth.jwt()->>'email');

