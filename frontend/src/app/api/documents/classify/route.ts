import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { withAuditLogging } from '@/lib/audit-middleware';
import { AUDIT_ACTIONS } from '@/lib/audit-constants';
import { DocumentStatus } from '@/types/database';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function handleClassification(request: Request, context: { userId: string, teamId: string }) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { documentId, storagePath } = await request.json();
  if (!documentId || !storagePath) {
    return NextResponse.json(
      { error: 'Document ID and storage path are required' },
      { status: 400 }
    );
  }

  // Get document details
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('team_id')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    return NextResponse.json(
      { error: 'Document not found' },
      { status: 404 }
    );
  }

  // Generate signed URL for document access
  const { data: signedUrlData, error: signedUrlError } = await supabase
    .storage
    .from('documents')
    .createSignedUrl(storagePath, 900); // 15 minutes expiry

  if (signedUrlError || !signedUrlData) {
    return NextResponse.json(
      { error: 'Failed to generate document access URL' },
      { status: 500 }
    );
  }

  const signedUrl = signedUrlData.signedUrl;

  try {
    // Classify document using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a freight document classifier. Examine the document and classify it accurately.'
        },
        {
          role: 'user',
          content: `Classify this freight document accessible at: ${signedUrl}`
        }
      ],
      functions: [
        {
          name: 'classifyDocument',
          description: 'Classify the freight document into one of the predefined categories',
          parameters: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['bol', 'pod', 'invoice', 'other'],
                description: 'The document type classification'
              },
              confidence: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                description: 'Confidence score between 0 and 1'
              },
              reason: {
                type: 'string',
                description: 'Explanation for the classification decision'
              }
            },
            required: ['type', 'confidence']
          }
        }
      ],
      function_call: { name: 'classifyDocument' }
    });

    // Parse classification result
    const classification = JSON.parse(response.choices[0].message.function_call?.arguments || '{}');

    // Update document with classification results
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        type: classification.type,
        confidence_score: classification.confidence,
        classification_reason: classification.reason,
        status: 'classified' as DocumentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update document:', updateError);
      return NextResponse.json(
        { error: 'Failed to update document classification' },
        { status: 500 }
      );
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
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Failed to classify document' },
      { status: 500 }
    );
  }
}

export const POST = withAuditLogging(handleClassification, {
  action: AUDIT_ACTIONS.CLASSIFY,
  getDocumentIds: (body) => [body.documentId],
  getMetadata: (body, result) => ({
    confidence: result?.classification?.confidence,
    type: result?.classification?.type,
    source: 'openai'
  })
}); 