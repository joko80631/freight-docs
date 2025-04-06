-- Create the documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    load_id UUID NOT NULL,
    path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_team_id ON documents(team_id);
CREATE INDEX IF NOT EXISTS idx_documents_load_id ON documents(load_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents table
CREATE POLICY "Team members can view their team's documents"
ON documents FOR SELECT
USING (
    team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Team members can create documents for their team"
ON documents FOR INSERT
WITH CHECK (
    team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Team members can update their team's documents"
ON documents FOR UPDATE
USING (
    team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Team members can delete their team's documents"
ON documents FOR DELETE
USING (
    team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
    )
);

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Team members can upload documents" ON storage.objects;
    DROP POLICY IF EXISTS "Team members can read their team's documents" ON storage.objects;
    DROP POLICY IF EXISTS "Team members can delete their team's documents" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create policy for uploading documents
CREATE POLICY "Team members can upload documents"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = (
    SELECT team_id::text 
    FROM team_members 
    WHERE user_id = auth.uid() 
    LIMIT 1
  )
);

-- Create policy for reading documents
CREATE POLICY "Team members can read their team's documents"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT team_id::text 
    FROM team_members 
    WHERE user_id = auth.uid()
  )
);

-- Create policy for deleting documents
CREATE POLICY "Team members can delete their team's documents"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = (
    SELECT team_id::text 
    FROM team_members 
    WHERE user_id = auth.uid() 
    LIMIT 1
  )
); 