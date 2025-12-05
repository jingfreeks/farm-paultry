-- Migration 019: Create company_settings table
-- This table stores company information like name and logo

CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL DEFAULT 'Golden Harvest Farm',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure only one row exists
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Insert default row if it doesn't exist
INSERT INTO company_settings (id, company_name, logo_url)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'Golden Harvest Farm', NULL)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read company settings (public)
CREATE POLICY "Company settings are viewable by everyone" ON company_settings
  FOR SELECT USING (true);

-- Policy: Only admins can update company settings
CREATE POLICY "Admins can update company settings" ON company_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'staff')
    )
  );

-- Policy: Only admins can insert company settings
CREATE POLICY "Admins can insert company settings" ON company_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'staff')
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_company_settings_updated_at();

-- Create index
CREATE INDEX IF NOT EXISTS idx_company_settings_id ON company_settings(id);

COMMENT ON TABLE company_settings IS 'Stores company information like name and logo. Only one row should exist.';
COMMENT ON COLUMN company_settings.id IS 'Fixed UUID to ensure only one row exists';

