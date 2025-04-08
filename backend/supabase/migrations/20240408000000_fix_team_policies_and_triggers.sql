-- Drop existing policies to recreate them
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
    DROP POLICY IF EXISTS "Users can create teams" ON teams;
    DROP POLICY IF EXISTS "Only team admins can update teams" ON teams;
    DROP POLICY IF EXISTS "Only team admins can delete teams" ON teams;
    DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
    DROP POLICY IF EXISTS "Users can add members to their teams" ON team_members;
    DROP POLICY IF EXISTS "Only team admins can manage team members" ON team_members;
    DROP POLICY IF EXISTS "Users can add themselves as team members" ON team_members;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create consistent RLS policies for teams
CREATE POLICY "Users can view teams they are members of"
    ON teams FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create teams"
    ON teams FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only team admins can update teams"
    ON teams FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
            AND team_members.role = 'ADMIN'
        )
    );

CREATE POLICY "Only team admins can delete teams"
    ON teams FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
            AND team_members.role = 'ADMIN'
        )
    );

-- Create consistent RLS policies for team members
CREATE POLICY "Users can view team members of their teams"
    ON team_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members AS tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Only team admins can manage team members"
    ON team_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_members AS tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
            AND tm.role = 'ADMIN'
        )
    );

-- Create or replace the function to prevent removing the last admin
CREATE OR REPLACE FUNCTION prevent_remove_last_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- If we're deleting a record
    IF (TG_OP = 'DELETE') THEN
        -- Check if this would remove the last admin
        IF OLD.role = 'ADMIN' AND (
            SELECT COUNT(*) FROM team_members 
            WHERE team_id = OLD.team_id 
            AND role = 'ADMIN'
        ) <= 1 THEN
            RAISE EXCEPTION 'Cannot remove the last admin of the team';
        END IF;
    -- If we're updating a record
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Check if this would remove the last admin
        IF OLD.role = 'ADMIN' AND NEW.role != 'ADMIN' AND (
            SELECT COUNT(*) FROM team_members 
            WHERE team_id = OLD.team_id 
            AND role = 'ADMIN'
        ) <= 1 THEN
            RAISE EXCEPTION 'Cannot remove the last admin of the team';
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger for preventing removal of last admin
DROP TRIGGER IF EXISTS prevent_remove_last_admin_trigger ON team_members;
CREATE TRIGGER prevent_remove_last_admin_trigger
    BEFORE UPDATE OR DELETE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION prevent_remove_last_admin();

-- Create or replace the function to add team creator as admin
CREATE OR REPLACE FUNCTION add_team_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'ADMIN');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger for adding team creator as admin
DROP TRIGGER IF EXISTS on_team_created ON teams;
CREATE TRIGGER on_team_created
    AFTER INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION add_team_creator_as_admin();

-- Add unique constraint to prevent duplicate team names per user
ALTER TABLE teams DROP CONSTRAINT IF EXISTS unique_team_name_per_creator;
ALTER TABLE teams ADD CONSTRAINT unique_team_name_per_creator 
    UNIQUE (name, created_by);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_role ON team_members(user_id, role);
CREATE INDEX IF NOT EXISTS idx_team_members_team_role ON team_members(team_id, role);

-- Create team audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on team audit logs
ALTER TABLE team_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for team audit logs
CREATE POLICY "Team admins can view audit logs"
    ON team_audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = team_audit_logs.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role = 'ADMIN'
        )
    );

-- Create function to log team audit events
CREATE OR REPLACE FUNCTION log_team_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO team_audit_logs (team_id, user_id, action, details)
        VALUES (
            NEW.team_id,
            auth.uid(),
            CASE TG_TABLE_NAME
                WHEN 'team_members' THEN 'member_added'
                WHEN 'teams' THEN 'team_created'
            END,
            jsonb_build_object(
                'role', COALESCE(NEW.role, NULL),
                'name', CASE WHEN TG_TABLE_NAME = 'teams' THEN NEW.name ELSE NULL END
            )
        );
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO team_audit_logs (team_id, user_id, action, details)
        VALUES (
            NEW.team_id,
            auth.uid(),
            CASE TG_TABLE_NAME
                WHEN 'team_members' THEN 'member_updated'
                WHEN 'teams' THEN 'team_updated'
            END,
            jsonb_build_object(
                'old_role', OLD.role,
                'new_role', NEW.role,
                'old_name', CASE WHEN TG_TABLE_NAME = 'teams' THEN OLD.name ELSE NULL END,
                'new_name', CASE WHEN TG_TABLE_NAME = 'teams' THEN NEW.name ELSE NULL END
            )
        );
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO team_audit_logs (team_id, user_id, action, details)
        VALUES (
            OLD.team_id,
            auth.uid(),
            CASE TG_TABLE_NAME
                WHEN 'team_members' THEN 'member_removed'
                WHEN 'teams' THEN 'team_deleted'
            END,
            jsonb_build_object(
                'role', OLD.role,
                'name', CASE WHEN TG_TABLE_NAME = 'teams' THEN OLD.name ELSE NULL END
            )
        );
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit log triggers
DROP TRIGGER IF EXISTS team_audit_log_trigger ON teams;
CREATE TRIGGER team_audit_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION log_team_audit_event();

DROP TRIGGER IF EXISTS team_member_audit_log_trigger ON team_members;
CREATE TRIGGER team_member_audit_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION log_team_audit_event(); 