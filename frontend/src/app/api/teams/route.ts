import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teams for the current user
    const { data: teams, error: teamsError } = await supabase
      .from('team_members')
      .select(`
        team_id,
        role,
        teams (
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', session.user.id);

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedTeams = teams.map(team => ({
      id: team.teams[0]?.id,
      name: team.teams[0]?.name,
      role: team.role,
      created_at: team.teams[0]?.created_at
    }));

    return NextResponse.json({ teams: transformedTeams });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{ name }])
      .select()
      .single();

    if (teamError) {
      console.error('Error creating team:', teamError);
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }

    // Add the creator as an admin
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        user_id: session.user.id,
        role: 'ADMIN'
      }]);

    if (memberError) {
      console.error('Error adding team member:', memberError);
      return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 