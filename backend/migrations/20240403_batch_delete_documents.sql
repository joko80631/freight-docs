-- Create function for batch deleting documents
CREATE OR REPLACE FUNCTION batch_delete_documents(
  p_team_id UUID,
  p_document_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify team membership
  IF NOT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'member')
  ) THEN
    RAISE EXCEPTION 'Not authorized to delete documents for this team';
  END IF;

  -- Delete documents in a transaction
  DELETE FROM documents
  WHERE team_id = p_team_id
  AND id = ANY(p_document_ids);

  -- Log the action
  INSERT INTO audit_logs (
    team_id,
    action,
    document_ids,
    metadata
  ) VALUES (
    p_team_id,
    'batch_delete',
    p_document_ids,
    jsonb_build_object(
      'count', array_length(p_document_ids, 1),
      'user_id', auth.uid()
    )
  );
END;
$$; 