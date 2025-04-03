-- Add classification columns to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS type VARCHAR(50),
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(4,3),
ADD COLUMN IF NOT EXISTS classified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS classified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS classification_reason TEXT,
ADD COLUMN IF NOT EXISTS source VARCHAR(50);

-- Create classification history table
CREATE TABLE IF NOT EXISTS classification_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    previous_type VARCHAR(50),
    new_type VARCHAR(50),
    confidence_score DECIMAL(4,3),
    classified_by UUID REFERENCES auth.users(id),
    classified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on document_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_classification_history_document_id 
ON classification_history(document_id);

-- Add RLS policies for classification_history
ALTER TABLE classification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view classification history for their team's documents"
ON classification_history
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM documents d
        WHERE d.id = classification_history.document_id
        AND d.team_id IN (
            SELECT team_id FROM team_members
            WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can insert classification history for their team's documents"
ON classification_history
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM documents d
        WHERE d.id = classification_history.document_id
        AND d.team_id IN (
            SELECT team_id FROM team_members
            WHERE user_id = auth.uid()
        )
    )
); 