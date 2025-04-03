import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the request body
    const { document_ids, document_type, reason } = await request.json();
    
    if (!document_ids || !Array.isArray(document_ids) || document_ids.length === 0 || !document_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get the first document to check team membership
    const { data: firstDocument, error: documentError } = await supabase
      .from('documents')
      .select('team_id')
      .eq('id', document_ids[0])
      .single();
    
    if (documentError || !firstDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Verify team membership
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', firstDocument.team_id)
      .eq('user_id', user.id)
      .single();
    
    if (teamError || !teamMember) {
      return NextResponse.json(
        { error: 'You do not have permission to reclassify documents for this team' },
        { status: 403 }
      );
    }
    
    // Update all documents in the batch with audit logging
    const { data: updatedDocuments, error: updateError } = await supabase
      .from('documents')
      .update({
        document_type,
        reclassification_reason: reason || null,
        reclassified_by: user.id,
        reclassified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', document_ids)
      .eq('team_id', firstDocument.team_id)
      .select();
    
    if (updateError) {
      console.error('Error reclassifying documents:', updateError);
      return NextResponse.json(
        { error: 'Failed to reclassify documents' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `${document_ids.length} document(s) reclassified successfully`,
      documents: updatedDocuments,
    });
    
  } catch (error) {
    console.error('Error in batch reclassify route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 