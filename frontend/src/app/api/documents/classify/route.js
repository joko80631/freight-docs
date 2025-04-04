import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { document_id, file_path } = await request.json();

    if (!document_id || !file_path) {
      return NextResponse.json(
        { error: 'Document ID and file path are required' },
        { status: 400 }
      );
    }

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify team membership
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', document.team_id)
      .eq('user_id', user.id)
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { error: 'Not a member of this team' },
        { status: 403 }
      );
    }

    // Classify document using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a document classification assistant. Your task is to classify freight documents into one of the following categories: BOL (Bill of Lading), POD (Proof of Delivery), Invoice, Rate Confirmation, or Other. Respond with a JSON object containing the document_type and confidence score (0-1)."
        },
        {
          role: "user",
          content: `Please classify this document based on its filename: ${document.name}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const classification = JSON.parse(completion.choices[0].message.content);

    // Update document with classification results
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        document_type: classification.document_type,
        classification_confidence: classification.confidence,
        status: 'classified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', document_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update document classification' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Document classification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 