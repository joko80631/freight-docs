import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
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

    // Security check: Ensure user belongs to the document's team
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', userId)
      .eq('team_id', document.team_id)
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this document' },
        { status: 403 }
      );
    }

    const previousType = document.type;
    const timestamp = new Date().toISOString();

    // Start a transaction to ensure data consistency
    const { data, error } = await supabase.rpc('reclassify_document', {
      p_document_id: documentId,
      p_previous_type: previousType,
      p_new_type: newType,
      p_classified_by: userId,
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

  } catch (error) {
    console.error('Reclassification error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 