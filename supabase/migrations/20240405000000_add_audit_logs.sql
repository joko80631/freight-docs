-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  document_ids UUID[] DEFAULT '{}',
  team_id UUID NOT NULL,
  user_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_team_id ON audit_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Setup RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Team members can view their team's audit logs
CREATE POLICY "Team members can view their team's audit logs"
ON audit_logs
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

-- Only allow insert from authenticated users for their own actions
CREATE POLICY "Users can create audit logs for their actions"
ON audit_logs
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

-- Create function for transactional audit logging
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action TEXT,
  p_document_ids UUID[] DEFAULT '{}',
  p_team_id UUID,
  p_user_id UUID,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    action,
    document_ids,
    team_id,
    user_id,
    metadata,
    created_at
  ) VALUES (
    p_action,
    p_document_ids,
    p_team_id,
    p_user_id,
    p_metadata,
    NOW()
  )
  RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_audit_log TO authenticated; 