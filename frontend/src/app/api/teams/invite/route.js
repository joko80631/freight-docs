import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { generateInviteToken } from '@/lib/utils/invite-token';
import { sendTeamInvite } from '@/lib/notifications';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']),
});

export async function POST(req) {
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
      .select('team_id, role, teams (name)')
      .eq('user_id', session.user.id)
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify the user is an admin
    if (teamMember.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the inviter's profile
    const { data: inviterProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', session.user.id)
      .single();

    if (profileError || !inviterProfile) {
      return NextResponse.json({ error: 'Failed to get inviter profile' }, { status: 500 });
    }

    // Generate invite token
    const inviteToken = generateInviteToken(teamMember.team_id, email);

    // Store the invite in the database
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .insert([{
        team_id: teamMember.team_id,
        email,
        role,
        token: inviteToken,
        invited_by: session.user.id,
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() // 72 hours
      }])
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    // Send the invitation email
    try {
      await sendTeamInvite({
        email,
        teamName: teamMember.teams.name,
        inviterName: inviterProfile.full_name,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/teams/join?token=${inviteToken}`,
        role
      });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({
      email,
      role,
      expires_at: invite.expires_at
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 