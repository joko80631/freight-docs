import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { validateInviteToken } from '@/lib/utils/invite-token';

export async function POST(req) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the invite token from the request body
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 });
    }

    // Validate the invite token
    const validationResult = validateInviteToken(token);
    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: validationResult.error || 'Invalid invite token',
        expired: validationResult.expired 
      }, { status: 400 });
    }

    const { teamId, email } = validationResult;

    // Verify the email matches the current user
    if (email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Invite token is not valid for this user' }, { status: 403 });
    }

    // Get the invite from the database
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if invite has expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    // Check if user is already a team member
    const { data: existingMember, error: memberError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'Already a team member' }, { status: 400 });
    }

    // Add user to team
    const { data: newMember, error: addError } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: session.user.id,
        role: invite.role
      }])
      .select()
      .single();

    if (addError) {
      console.error('Error adding team member:', addError);
      return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
    }

    // Delete the used invite
    const { error: deleteError } = await supabase
      .from('team_invites')
      .delete()
      .eq('token', token);

    if (deleteError) {
      console.error('Error deleting invite:', deleteError);
      // Don't fail the request if invite deletion fails
    }

    return NextResponse.json({
      team_id: teamId,
      role: invite.role
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 