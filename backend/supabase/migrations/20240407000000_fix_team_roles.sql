-- Drop existing user_role type
DROP TYPE IF EXISTS user_role;

-- Create new user_role type with consistent values
CREATE TYPE user_role AS ENUM ('ADMIN', 'MEMBER');

-- Update existing team_members to use new roles
UPDATE team_members
SET role = 'ADMIN'
WHERE role IN ('owner', 'admin', 'ADMIN', 'MANAGER');

UPDATE team_members
SET role = 'MEMBER'
WHERE role IN ('member', 'USER');

-- Modify team_members table to use the new type
ALTER TABLE team_members 
ALTER COLUMN role TYPE user_role 
USING role::user_role;

-- Add RLS policy for team creation
CREATE POLICY "Users can create teams"
    ON teams FOR INSERT
    WITH CHECK (true);

-- Add RLS policy for team member creation
CREATE POLICY "Users can add themselves as team members"
    ON team_members FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Add trigger to automatically add creator as admin
CREATE OR REPLACE FUNCTION add_team_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'ADMIN');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_team_created
    AFTER INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION add_team_creator_as_admin(); 