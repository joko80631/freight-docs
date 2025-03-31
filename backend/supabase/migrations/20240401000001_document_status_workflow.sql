-- Create enum for document status
CREATE TYPE document_status AS ENUM (
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'NEEDS_CLARIFICATION',
  'EXPIRED'
);

-- Add new columns to documents table
ALTER TABLE documents
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
ADD COLUMN status_updated_by UUID REFERENCES auth.users,
ADD COLUMN status document_status NOT NULL DEFAULT 'PENDING_REVIEW';

-- Create document status history table
CREATE TABLE document_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents ON DELETE CASCADE NOT NULL,
  status document_status NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX idx_document_status_history_document_id ON document_status_history(document_id);
CREATE INDEX idx_document_status_history_created_at ON document_status_history(created_at);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_due_date ON documents(due_date);

-- Create function to handle status changes
CREATE OR REPLACE FUNCTION handle_document_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record history if status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO document_status_history (
      document_id,
      status,
      comment,
      created_by
    ) VALUES (
      NEW.id,
      NEW.status,
      NEW.status_comment,
      NEW.status_updated_by
    );
  END IF;
  
  -- Update status_updated_at and status_updated_by
  NEW.status_updated_at = TIMEZONE('utc'::text, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status changes
CREATE TRIGGER on_document_status_change
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION handle_document_status_change();

-- Add RLS policies for document status history
ALTER TABLE document_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view status history for their documents"
  ON document_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_status_history.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create status history entries for their documents"
  ON document_status_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_status_history.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Add comments to explain the new columns
COMMENT ON COLUMN documents.due_date IS 'Due date for document review';
COMMENT ON COLUMN documents.status_updated_at IS 'Timestamp of last status change';
COMMENT ON COLUMN documents.status_updated_by IS 'User who last updated the status';
COMMENT ON COLUMN documents.status IS 'Current status of the document';
COMMENT ON COLUMN document_status_history.comment IS 'Comment explaining the status change'; 