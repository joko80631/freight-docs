-- Function to handle document reclassification with transaction support
CREATE OR REPLACE FUNCTION reclassify_document(
  p_document_id UUID,
  p_previous_type VARCHAR,
  p_new_type VARCHAR,
  p_classified_by UUID,
  p_classified_at TIMESTAMPTZ,
  p_team_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Start transaction
  BEGIN
    -- Update document type
    UPDATE documents
    SET 
      type = p_new_type,
      classified_by = p_classified_by,
      classified_at = p_classified_at,
      source = 'user'
    WHERE id = p_document_id;
    
    -- Insert into classification history
    INSERT INTO classification_history (
      document_id,
      previous_type,
      new_type,
      confidence_score,
      classified_by,
      classified_at,
      source,
      reason
    ) VALUES (
      p_document_id,
      p_previous_type,
      p_new_type,
      NULL, -- No confidence score for manual classification
      p_classified_by,
      p_classified_at,
      'user',
      'Manual reclassification by user'
    );
    
    -- Create audit log entry
    INSERT INTO audit_logs (
      action,
      document_ids,
      team_id,
      user_id,
      metadata,
      created_at
    ) VALUES (
      'reclassify_document',
      ARRAY[p_document_id],
      p_team_id,
      p_classified_by,
      jsonb_build_object(
        'previous_type', p_previous_type,
        'new_type', p_new_type,
        'source', 'user'
      ),
      p_classified_at
    );
    
    -- Commit transaction
    result = json_build_object(
      'success', true,
      'document_id', p_document_id,
      'new_type', p_new_type
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback transaction on any error
    RAISE;
  END;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reclassify_document TO authenticated; 