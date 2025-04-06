-- Add email_preferences column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_preferences JSONB NOT NULL DEFAULT '{"global_enabled": true}'::jsonb;

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN profiles.email_preferences IS 'User email preferences stored as JSONB with default opt-in';

-- Create a function to ensure email_preferences always has the required structure
CREATE OR REPLACE FUNCTION ensure_email_preferences_structure()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure the email_preferences column exists and has the required structure
  IF NEW.email_preferences IS NULL THEN
    NEW.email_preferences := '{"global_enabled": true}'::jsonb;
  ELSIF NOT (NEW.email_preferences ? 'global_enabled') THEN
    NEW.email_preferences := NEW.email_preferences || '{"global_enabled": true}'::jsonb;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to ensure email_preferences structure on insert or update
DROP TRIGGER IF EXISTS ensure_email_preferences_structure_trigger ON profiles;
CREATE TRIGGER ensure_email_preferences_structure_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_email_preferences_structure();

-- Update RLS policies to ensure preferences are always accessible to the user
-- This assumes you have an existing RLS policy on profiles
-- If not, you'll need to create one

-- Example RLS policy for profiles (if not already exists):
-- CREATE POLICY "Users can view their own profile"
--   ON profiles FOR SELECT
--   USING (auth.uid() = id);

-- CREATE POLICY "Users can update their own profile"
--   ON profiles FOR UPDATE
--   USING (auth.uid() = id);

-- Ensure all existing users have the email_preferences column set
UPDATE profiles
SET email_preferences = '{"global_enabled": true}'::jsonb
WHERE email_preferences IS NULL; 