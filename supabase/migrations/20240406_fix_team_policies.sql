-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their team members" ON team_members;
DROP POLICY IF EXISTS "Users can manage their team members" ON team_members;

-- Create new policies without recursive checks
CREATE POLICY "Users can view their team members"
ON team_members FOR SELECT
USING (
  -- User can view members of teams they belong to
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their team members"
ON team_members FOR ALL
USING (
  -- User must be an admin of the team
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
    AND tm.role = 'admin'
  )
); 