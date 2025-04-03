import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
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
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return NextResponse.json(
        { error: getErrorMessage(sessionError) },
        { status: 401 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's teams
    const { data: userTeams, error: userTeamsError } = await supabase
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

    if (userTeamsError) {
      return NextResponse.json(
        { error: getErrorMessage(userTeamsError) },
        { status: 500 }
      );
    }

    return NextResponse.json(userTeams);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return NextResponse.json(
        { error: getErrorMessage(sessionError) },
        { status: 401 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get request body
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{ name }])
      .select()
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: getErrorMessage(teamError) },
        { status: 500 }
      );
    }

    // Add user as admin
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        user_id: session.user.id,
        role: 'ADMIN'
      }]);

    if (memberError) {
      return NextResponse.json(
        { error: getErrorMessage(memberError) },
        { status: 500 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
} 