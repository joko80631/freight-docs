import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { withAuditLogging } from '@/lib/audit-middleware';
import { AUDIT_ACTIONS } from '@/lib/audit-constants';

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
  let classification;
  try {
    const functionCall = response.choices[0].message.function_call;
    if (!functionCall) {
      throw new Error('No function call returned from OpenAI');
    }
    classification = JSON.parse(functionCall.arguments);
  } catch (error) {
    // Fallback: Parse from text response
    const content = response.choices[0].message.content || '';
    const typeMatch = content.match(/type:?\s*([a-z]+)/i);
    const confidenceMatch = content.match(/confidence:?\s*(0\.\d+)/i);
    
    classification = {
      type: typeMatch ? typeMatch[1].toLowerCase() : 'other',
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
      reason: 'Extracted from text response'
    };
  }

  // Update document record
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      type: classification.type,
      confidence_score: classification.confidence,
      classified_by: context.userId,
      classified_at: new Date().toISOString(),
      classification_reason: classification.reason || null,
      source: 'openai'
    })
    .eq('id', documentId);

  if (updateError) {
    console.error('Failed to update document:', updateError);
    return NextResponse.json(
      { error: 'Failed to update document classification' },
      { status: 500 }
    );
  }

  // Create classification history record
  const { error: historyError } = await supabase
    .from('classification_history')
    .insert({
      document_id: documentId,
      previous_type: null,
      new_type: classification.type,
      confidence_score: classification.confidence,
      classified_by: context.userId,
      classified_at: new Date().toISOString(),
      source: 'openai',
      reason: classification.reason || null
    });

  if (historyError) {
    console.error('Failed to create classification history:', historyError);
  }

  return NextResponse.json({
    success: true,
    classification: {
      type: classification.type,
      confidence: classification.confidence,
      reason: classification.reason
    }
  });
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