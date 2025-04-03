import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getErrorMessage } from '@/lib/errors';

interface Team {
  id: string;
  name: string;
  created_at: string;
}

interface TeamMember {
  team_id: string;
  user_id: string;
  role: string;
  teams?: Team;
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Debug logging for session
    console.log('Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      aud: session?.user?.aud,
      error: sessionError?.message,
      cookiesPresent: cookieStore.getAll().length > 0
    });

    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: getErrorMessage(sessionError)
      }, { status: 401 });
    }
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No active session', 
        details: 'Please log in to access teams' 
      }, { status: 401 });
    }

    // First check if user has any teams
    const { data: userTeams, error: userTeamsError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', session.user.id);

    console.log('User teams check:', {
      userId: session.user.id,
      teamsCount: userTeams?.length,
      error: userTeamsError?.message
    });

    if (userTeamsError) {
      console.error('Error checking user teams:', userTeamsError);
      return NextResponse.json({ 
        error: 'Failed to check user teams', 
        details: getErrorMessage(userTeamsError)
      }, { status: 500 });
    }

    // If user has no teams, return empty array instead of error
    if (!userTeams || userTeams.length === 0) {
      return NextResponse.json({ 
        teams: [],
        status: 'empty'
      });
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

    console.log('Teams query result:', {
      teamsFound: teams?.length,
      hasError: !!teamsError,
      errorMessage: teamsError?.message
    });

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return NextResponse.json({ 
        error: 'Failed to fetch teams', 
        details: getErrorMessage(teamsError)
      }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedTeams = teams
      .filter(team => team.teams)
      .map(team => ({
        id: team.teams!.id,
        name: team.teams!.name,
        role: team.role,
        created_at: team.teams!.created_at
      }));

    console.log('Transformed teams:', {
      originalCount: teams.length,
      transformedCount: transformedTeams.length,
      hasTeams: transformedTeams.length > 0
    });

    return NextResponse.json({ 
      teams: transformedTeams,
      status: transformedTeams.length === 0 ? 'empty' : 'success'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: getErrorMessage(error)
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: getErrorMessage(sessionError)
      }, { status: 401 });
    }

    if (!session) {
      return NextResponse.json({ 
        error: 'No active session', 
        details: 'Please log in to access teams' 
      }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ 
        error: 'Name is required',
        details: 'Team name cannot be empty'
      }, { status: 400 });
    }

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{ name }])
      .select()
      .single<Team>();

    if (teamError || !team) {
      console.error('Error creating team:', teamError);
      return NextResponse.json({ 
        error: 'Failed to create team',
        details: getErrorMessage(teamError)
      }, { status: 500 });
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
      return NextResponse.json({ 
        error: 'Failed to add team member',
        details: getErrorMessage(memberError)
      }, { status: 500 });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: getErrorMessage(error)
    }, { status: 500 });
  }
} 