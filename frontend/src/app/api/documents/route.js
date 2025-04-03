import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('team_id', teamId);

    // Apply filters
    const documentType = searchParams.get('documentType');
    const confidence = searchParams.get('confidence');
    const loadStatus = searchParams.get('loadStatus');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');

    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    if (confidence) {
      switch (confidence) {
        case 'high':
          query = query.gte('classification_confidence', 0.9);
          break;
        case 'medium':
          query = query
            .gte('classification_confidence', 0.7)
            .lt('classification_confidence', 0.9);
          break;
        case 'low':
          query = query.lt('classification_confidence', 0.7);
          break;
      }
    }

    if (loadStatus === 'linked') {
      query = query.not('load_id', 'is', null);
    } else if (loadStatus === 'unlinked') {
      query = query.is('load_id', null);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: documents, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      documents,
      total: count,
      page,
      limit,
    });
  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const formData = await request.json();
    const {
      team_id,
      name,
      file_path,
      file_url,
      file_type,
      file_size,
      load_id,
    } = formData;

    // Verify team membership
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', team_id)
      .eq('user_id', user.id)
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { error: 'Not a member of this team' },
        { status: 403 }
      );
    }

    // Create document record
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert([
        {
          team_id,
          name,
          file_path,
          file_url,
          file_type,
          file_size,
          load_id,
          uploaded_by: user.id,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (documentError) {
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      );
    }

    // Trigger document classification
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: document.id,
          file_path: document.file_path,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to classify document');
      }
    } catch (error) {
      console.error('Classification error:', error);
      // Don't fail the request if classification fails
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, team_id, ...updateData } = body;

    if (!id || !team_id) {
      return NextResponse.json({ error: 'Document ID and Team ID are required' }, { status: 400 });
    }

    // Verify user is a member of the team
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', team_id)
      .eq('user_id', user.id)
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
    }

    const { data: document, error: docError } = await supabase
      .from('documents')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('team_id', team_id)
      .select()
      .single();

    if (docError) {
      console.error('Error updating document:', docError);
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error in PUT /api/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const teamId = searchParams.get('team_id');

    if (!id || !teamId) {
      return NextResponse.json({ error: 'Document ID and Team ID are required' }, { status: 400 });
    }

    // Verify user is a member of the team
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);

    if (deleteError) {
      console.error('Error deleting document:', deleteError);
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 