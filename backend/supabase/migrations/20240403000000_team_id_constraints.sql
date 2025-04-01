-- Add NOT NULL constraints to team_id columns
ALTER TABLE loads ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE documents ALTER COLUMN team_id SET NOT NULL;

-- Backfill existing loads with team_id from user's first team
DO $$
DECLARE
    v_user_id UUID;
    v_team_id UUID;
BEGIN
    -- For each user with loads but no team_id
    FOR v_user_id IN 
        SELECT DISTINCT user_id 
        FROM loads 
        WHERE team_id IS NULL
    LOOP
        -- Get their first team
        SELECT team_id INTO v_team_id
        FROM team_members
        WHERE user_id = v_user_id
        LIMIT 1;

        -- If they have a team, update their loads
        IF v_team_id IS NOT NULL THEN
            UPDATE loads
            SET team_id = v_team_id
            WHERE user_id = v_user_id
            AND team_id IS NULL;
        END IF;
    END LOOP;
END $$;

-- Backfill existing documents with team_id from their load
UPDATE documents d
SET team_id = l.team_id
FROM loads l
WHERE d.load_id = l.id
AND d.team_id IS NULL;

-- Add foreign key constraints
ALTER TABLE loads 
ADD CONSTRAINT fk_loads_team 
FOREIGN KEY (team_id) 
REFERENCES teams(id) 
ON DELETE CASCADE;

ALTER TABLE documents 
ADD CONSTRAINT fk_documents_team 
FOREIGN KEY (team_id) 
REFERENCES teams(id) 
ON DELETE CASCADE;

-- Add indexes for team_id columns
CREATE INDEX IF NOT EXISTS idx_loads_team_id ON loads(team_id);
CREATE INDEX IF NOT EXISTS idx_documents_team_id ON documents(team_id);

-- Add RLS policies to ensure team_id matches
CREATE POLICY "Team members can only access their team's loads"
    ON loads FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = loads.team_id
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can only access their team's documents"
    ON documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = documents.team_id
            AND team_members.user_id = auth.uid()
        )
    ); 