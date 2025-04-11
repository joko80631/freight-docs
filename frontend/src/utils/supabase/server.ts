import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie errors
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie errors
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
};

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie errors
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie errors
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
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