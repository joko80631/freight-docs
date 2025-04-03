-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  document_ids UUID[] NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS audit_logs_team_id_idx ON audit_logs(team_id);
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);

-- Add RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to view audit logs for their team
CREATE POLICY "Users can view their team's audit logs"
  ON audit_logs FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'member')
    )
  );

-- Allow users to insert audit logs for their team
CREATE POLICY "Users can insert audit logs for their team"
  ON audit_logs FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'member')
    )
  );

-- Prevent users from updating or deleting audit logs
CREATE POLICY "Users cannot update audit logs"
  ON audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete audit logs"
  ON audit_logs FOR DELETE
  USING (false); 