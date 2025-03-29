-- Add file_hash column to documents table
ALTER TABLE documents
ADD COLUMN file_hash TEXT;

-- Create index on file_hash and user_id for efficient lookups
CREATE INDEX idx_documents_file_hash_user_id ON documents(file_hash, user_id); 