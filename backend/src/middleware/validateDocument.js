import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const VALID_STATUSES = [
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'NEEDS_CLARIFICATION',
  'EXPIRED'
];

export const validateDocumentStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: ' + VALID_STATUSES.join(', ')
      });
    }

    // Validate comment for certain statuses
    const requiresComment = ['REJECTED', 'NEEDS_CLARIFICATION'].includes(status);
    if (requiresComment && !comment) {
      return res.status(400).json({
        error: 'Comment is required for this status change'
      });
    }

    // Get current document status
    const { data: document, error } = await supabase
      .from('documents')
      .select('status')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    // Validate status transition
    if (document.status === status) {
      return res.status(400).json({
        error: 'Document is already in this status'
      });
    }

    // Add document to request for use in route handler
    req.document = document;
    next();
  } catch (error) {
    console.error('Error validating document status:', error);
    res.status(500).json({ error: 'Failed to validate document status' });
  }
}; 