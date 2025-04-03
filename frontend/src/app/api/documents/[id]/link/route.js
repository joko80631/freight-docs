import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
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

    const { id } = params;
    const { load_id } = await request.json();

    if (!load_id) {
      return NextResponse.json(
        { error: 'Load ID is required' },
        { status: 400 }
      );
    }

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
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

    // Verify load belongs to the same team
    const { data: load, error: loadError } = await supabase
      .from('loads')
      .select('id')
      .eq('id', load_id)
      .eq('team_id', document.team_id)
      .single();

    if (loadError || !load) {
      return NextResponse.json(
        { error: 'Load not found or not accessible' },
        { status: 404 }
      );
    }

    // Update document with load ID
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        load_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to link document to load' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Document link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 