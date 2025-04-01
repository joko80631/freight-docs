import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

interface Team {
  id: string;
  name: string;
  created_at: string;
}

interface TeamMember {
  team_id: string;
  role: string;
  teams: Team;
}

interface TransformedTeam {
  id: string;
  name: string;
  role: string;
  created_at: string;
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: sessionError.message 
      }, { status: 401 });
    }
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No active session', 
        details: 'Please log in to access teams' 
      }, { status: 401 });
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
      .eq('user_id', session.user.id)
      .returns<TeamMember[]>();

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return NextResponse.json({ 
        error: 'Failed to fetch teams', 
        details: teamsError.message 
      }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedTeams: TransformedTeam[] = teams
      .filter(team => team.teams)
      .map(team => ({
        id: team.teams.id,
        name: team.teams.name,
        role: team.role,
        created_at: team.teams.created_at
      }));

    return NextResponse.json({ teams: transformedTeams });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
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