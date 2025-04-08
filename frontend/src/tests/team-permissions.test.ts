import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Team Permissions', () => {
  const supabase = createClientComponentClient();
  let teamId: string;
  let adminId: string;
  let managerId: string;

  beforeEach(async () => {
    // Create a test team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({ name: 'Test Team' })
      .select()
      .single();

    if (teamError) throw teamError;
    teamId = team.id;

    // Create test users
    const { data: admin, error: adminError } = await supabase.auth.signUp({
      email: 'admin@test.com',
      password: 'password123',
    });
    if (adminError) throw adminError;
    adminId = admin.user!.id;

    const { data: manager, error: managerError } = await supabase.auth.signUp({
      email: 'manager@test.com',
      password: 'password123',
    });
    if (managerError) throw managerError;
    managerId = manager.user!.id;

    // Add users to team with respective roles
    await supabase.from('team_members').insert([
      { team_id: teamId, user_id: adminId, role: 'ADMIN' },
      { team_id: teamId, user_id: managerId, role: 'MEMBER' },
    ]);
  });

  afterEach(async () => {
    // Clean up test data
    await supabase.from('teams').delete().eq('id', teamId);
  });

  it('should not allow a MEMBER to remove an ADMIN', async () => {
    // Sign in as manager
    await supabase.auth.signInWithPassword({
      email: 'manager@test.com',
      password: 'password123',
    });

    // Try to remove admin
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', adminId);

    // Should fail due to RLS policy
    expect(error).toBeTruthy();
    expect(error?.message).toContain('permission denied');
  });

  it('should allow an ADMIN to remove a MEMBER', async () => {
    // Sign in as admin
    await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'password123',
    });

    // Remove manager
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', managerId);

    // Should succeed
    expect(error).toBeNull();
  });

  it('should not allow removing the last ADMIN', async () => {
    // Sign in as admin
    await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'password123',
    });

    // Try to remove self (last admin)
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', adminId);

    // Should fail due to trigger
    expect(error).toBeTruthy();
    expect(error?.message).toContain('Cannot remove the last admin');
  });
}); 