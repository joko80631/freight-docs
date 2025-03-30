-- Enable RLS on the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has access to a file
CREATE OR REPLACE FUNCTION public.check_file_access(file_path text)
RETURNS boolean AS $$
BEGIN
  -- Extract user_id from file path (format: user_id/filename)
  DECLARE
    user_id uuid;
  BEGIN
    user_id := (regexp_match(file_path, '^([^/]+)/'))[1]::uuid;
    RETURN auth.uid() = user_id;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for uploading files
CREATE POLICY "Users can upload files to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for reading files
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  check_file_access(name)
);

-- Policy for updating files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  check_file_access(name)
)
WITH CHECK (
  bucket_id = 'documents' AND
  check_file_access(name)
);

-- Policy for deleting files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  check_file_access(name)
);

-- Function to get storage policies
CREATE OR REPLACE FUNCTION public.get_storage_policies(bucket_name text)
RETURNS TABLE (
  policy_name text,
  permissive text,
  roles text[],
  cmd text,
  qual text,
  with_check text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.policyname as policy_name,
    p.permissive,
    p.roles,
    p.cmd,
    p.qual,
    p.with_check
  FROM pg_policies p
  WHERE p.tablename = 'objects'
  AND p.schemaname = 'storage';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 