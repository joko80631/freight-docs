-- Create user_role enum
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- Create teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', now()),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create team_members table
CREATE TABLE team_members (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', now()),
    PRIMARY KEY (team_id, user_id)
);

-- Add team_id to loads table
ALTER TABLE loads 
ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Add team_id to documents table
ALTER TABLE documents 
ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Create indexes for efficient lookups
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_loads_team_id ON loads(team_id);
CREATE INDEX idx_documents_team_id ON documents(team_id);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teams
CREATE POLICY "Users can view teams they are members of"
    ON teams FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
        )
    );

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

-- Create RLS policies for team_members
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

-- Update RLS policies for loads
DROP POLICY IF EXISTS "Users can view their own loads" ON loads;
DROP POLICY IF EXISTS "Users can update their own loads" ON loads;
DROP POLICY IF EXISTS "Users can delete their own loads" ON loads;

CREATE POLICY "Team members can view team loads"
    ON loads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = loads.team_id
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can update team loads"
    ON loads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = loads.team_id
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can delete team loads"
    ON loads FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = loads.team_id
            AND team_members.user_id = auth.uid()
        )
    );

-- Update RLS policies for documents
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;

CREATE POLICY "Team members can view team documents"
    ON documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = documents.team_id
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can update team documents"
    ON documents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = documents.team_id
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can delete team documents"
    ON documents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = documents.team_id
            AND team_members.user_id = auth.uid()
        )
    );

-- Create trigger to prevent removing the last admin
CREATE OR REPLACE FUNCTION prevent_remove_last_admin()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role = 'ADMIN' THEN
        IF NOT EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = OLD.team_id
            AND role = 'ADMIN'
            AND user_id != OLD.user_id
        ) THEN
            RAISE EXCEPTION 'Cannot remove the last admin from a team';
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_remove_last_admin_trigger
    BEFORE UPDATE OR DELETE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION prevent_remove_last_admin();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 