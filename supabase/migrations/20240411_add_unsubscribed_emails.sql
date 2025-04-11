-- Create table for unsubscribed emails
CREATE TABLE unsubscribed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  reason TEXT,
  unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Create index for faster lookups
CREATE INDEX idx_unsubscribed_emails_email ON unsubscribed_emails(email);

-- Create RLS policies
ALTER TABLE unsubscribed_emails ENABLE ROW LEVEL SECURITY;

-- Service role can manage all unsubscribed emails
CREATE POLICY "Service role can manage all unsubscribed emails"
  ON unsubscribed_emails FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to check if an email is unsubscribed
CREATE OR REPLACE FUNCTION is_email_unsubscribed(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM unsubscribed_emails WHERE email = p_email
  );
END;
$$ LANGUAGE plpgsql; 