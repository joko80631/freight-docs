import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { withAuditLogging, AUDIT_ACTIONS } from '@/lib/audit-middleware-stub';

async function handleReclassification(request: Request, context: { userId: string, teamId: string }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { documentId, newType } = await request.json();
  
  if (!documentId || !newType) {
    return NextResponse.json(
      { error: 'Document ID and new type are required' },
      { status: 400 }
    );
  }

  // Validate document type
  const validTypes = ['bol', 'pod', 'invoice', 'other'];
  if (!validTypes.includes(newType)) {
    return NextResponse.json(
      { error: 'Invalid document type' },
      { status: 400 }
    );
  }

  // Get current document details (including team_id for security check)
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('id, team_id, type')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    return NextResponse.json(
      { error: 'Document not found' },
      { status: 404 }
    );
  }

  const previousType = document.type;
  const timestamp = new Date().toISOString();

  // Start a transaction to ensure data consistency
  const { data, error } = await supabase.rpc('reclassify_document', {
    p_document_id: documentId,
    p_previous_type: previousType,
    p_new_type: newType,
    p_classified_by: context.userId,
    p_classified_at: timestamp,
    p_team_id: document.team_id
  });

  if (error) {
    console.error('Transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to reclassify document' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    document: {
      id: documentId,
      type: newType,
      previous_type: previousType
    }
  });
}

export const POST = withAuditLogging(handleReclassification, {
  action: AUDIT_ACTIONS.RECLASSIFY,
  getDocumentIds: (body) => [body.documentId],
  getMetadata: (body, result) => ({
    previous_type: result?.document?.previous_type,
    new_type: body.newType,
    source: 'user'
  })
}); 