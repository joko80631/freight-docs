import { SupabaseClient } from '@supabase/supabase-js';

export async function getTeamId(supabase: SupabaseClient): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .single();
      
    return teamMember?.team_id || null;
  } catch (error) {
    console.error('Error getting team ID:', error);
    return null;
  }
} 