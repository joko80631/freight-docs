-- Create the documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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

-- Create policy for deleting documents (optional, if needed)
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