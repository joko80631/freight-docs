import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import useTeamStore from '@/store/teamStore';

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get team_id from query params or user's default team
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
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

    const { data: loads, error: loadsError } = await supabase
      .from('loads')
      .select(`
        *,
        documents (
          id,
          type,
          status
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (loadsError) {
      console.error('Error fetching loads:', loadsError);
      return NextResponse.json({ error: 'Failed to fetch loads' }, { status: 500 });
    }

    return NextResponse.json(loads || []);
  } catch (error) {
    console.error('Error in GET /api/loads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { team_id, ...loadData } = body;

    if (!team_id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
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

    const { data: load, error: loadError } = await supabase
      .from('loads')
      .insert([
        {
          ...loadData,
          team_id,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (loadError) {
      console.error('Error creating load:', loadError);
      return NextResponse.json({ error: 'Failed to create load' }, { status: 500 });
    }

    return NextResponse.json(load);
  } catch (error) {
    console.error('Error in POST /api/loads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
      return NextResponse.json({ error: 'Load ID and Team ID are required' }, { status: 400 });
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

    const { data: load, error: loadError } = await supabase
      .from('loads')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('team_id', team_id)
      .select()
      .single();

    if (loadError) {
      console.error('Error updating load:', loadError);
      return NextResponse.json({ error: 'Failed to update load' }, { status: 500 });
    }

    return NextResponse.json(load);
  } catch (error) {
    console.error('Error in PUT /api/loads:', error);
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
      return NextResponse.json({ error: 'Load ID and Team ID are required' }, { status: 400 });
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
      .from('loads')
      .delete()
      .eq('id', id)
      .eq('team_id', teamId);

    if (deleteError) {
      console.error('Error deleting load:', deleteError);
      return NextResponse.json({ error: 'Failed to delete load' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/loads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 