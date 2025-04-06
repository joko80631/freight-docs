-- Add email-related columns to audit_logs table
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS email_recipient TEXT,
ADD COLUMN IF NOT EXISTS email_template TEXT;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_email_recipient ON audit_logs(email_recipient);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email_template ON audit_logs(email_template);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email_activity ON audit_logs(action, email_recipient, email_template) 
WHERE email_recipient IS NOT NULL OR email_template IS NOT NULL;

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN audit_logs.email_recipient IS 'Email address of the recipient for email-related actions';
COMMENT ON COLUMN audit_logs.email_template IS 'Template identifier used for email-related actions'; 