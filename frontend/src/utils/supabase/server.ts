import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({ cookies });
};

export const getServerSession = async () => {
  const supabase = createServerSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting server session:', error);
    return null;
  }
  
  return session;
};

export const getServerUser = async () => {
  const session = await getServerSession();
  return session?.user || null;
};

export const getServerUserProfile = async () => {
  const user = await getServerUser();
  if (!user) return null;
  
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
  
  return data;
};

export const getServerTeamMembers = async (teamId: string) => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      profiles:profile_id (*)
    `)
    .eq('team_id', teamId);
  
  if (error) {
    console.error('Error getting team members:', error);
    return [];
  }
  
  return data || [];
};

export const getServerTeamInvites = async (teamId: string) => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('team_invites')
    .select('*')
    .eq('team_id', teamId);
  
  if (error) {
    console.error('Error getting team invites:', error);
    return [];
  }
  
  return data || [];
};

export const getServerUserTeams = async () => {
  const user = await getServerUser();
  if (!user) return [];
  
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      teams:team_id (*)
    `)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error getting user teams:', error);
    return [];
  }
  
  return data || [];
}; 