import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
});

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const result = inviteSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { email, role } = result.data;

    // Get the user's current team
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', session.user.id)
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify the user is an admin
    if (teamMember.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already a member
    const { data: existingMember, error: memberError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamMember.team_id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
    }

    // Add the user to the team
    const { data: newMember, error: addError } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamMember.team_id,
        user_id: user.id,
        role
      }])
      .select(`
        user_id,
        role,
        users (
          email
        )
      `)
      .single();

    if (addError) {
      console.error('Error adding team member:', addError);
      return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
    }

    return NextResponse.json({
      user_id: newMember.user_id,
      email: newMember.users[0]?.email,
      role: newMember.role
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 