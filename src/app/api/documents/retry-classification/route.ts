import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { withAuditLogging, AUDIT_ACTIONS } from '@/lib/audit-middleware-stub';
import { createAuditLog } from '@/lib/audit-logger';
import { getTeamId } from '@/lib/auth';
import { classifyDocument } from '@/lib/document-classifier';

export const runtime = 'edge';

async function handler(request: Request) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const teamId = await getTeamId(supabase);
    
    if (!teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await request.json();
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Get document details
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('team_id', teamId)
      .single();

    if (documentError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get document content from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('documents')
      .download(document.storage_path);

    if (fileError || !fileData) {
      return NextResponse.json({ error: 'Failed to retrieve document content' }, { status: 500 });
    }

    // Convert file to text
    const text = await fileData.text();

    // Classify document
    const classification = await classifyDocument(text);

    // Update document with new classification
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        type: classification.type,
        confidence_score: classification.confidence,
        classification_reason: classification.reason,
        source: 'openai_retry'
      })
      .eq('id', documentId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    // Add to classification history
    const { error: historyError } = await supabase
      .from('classification_history')
      .insert({
        document_id: documentId,
        previous_type: document.type,
        new_type: classification.type,
        confidence_score: classification.confidence,
        source: 'openai_retry',
        classified_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('Failed to add classification history:', historyError);
    }

    return NextResponse.json({ 
      success: true,
      classification: {
        type: classification.type,
        confidence: classification.confidence,
        reason: classification.reason
      }
    });

  } catch (error) {
    console.error('Error retrying classification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuditLogging(handler, {
  action: AUDIT_ACTIONS.CLASSIFY,
  getDocumentIds: (body) => [body.documentId],
  getMetadata: (body, result) => ({
    source: 'retry'
  })
}); 