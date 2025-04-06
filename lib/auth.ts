import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function getCurrentUser() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export async function isUserAuthorized(userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return false;

  // Add any additional authorization checks here
  // For example, checking user roles, permissions, etc.
  return currentUser.id === userId;
}

export async function getUserTeams(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: teams, error } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user teams:', error);
      return [];
    }

    return teams;
  } catch (error) {
    console.error('Error in getUserTeams:', error);
    return [];
  }
} 