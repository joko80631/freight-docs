import { useEffect } from 'react';
import { useTeamStore } from '@/store/team-store';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useTeamInitializer() {
  const { fetchTeams, teams, currentTeam, isLoading, hasAttemptedLoad, error } = useTeamStore();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function initializeTeams() {
      if (!hasAttemptedLoad && !isLoading) {
        // Check authentication first
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('Auth error:', authError);
          router.push('/login');
          return;
        }

        if (!session) {
          router.push('/login');
          return;
        }

        // If authenticated, fetch teams
        await fetchTeams();
      }
    }

    initializeTeams();
  }, [fetchTeams, hasAttemptedLoad, isLoading, router, supabase.auth]);

  useEffect(() => {
    // If teams are loaded but no current team is selected, redirect to teams page
    if (hasAttemptedLoad && !isLoading && teams.length === 0) {
      router.push('/teams/new');
    }
  }, [hasAttemptedLoad, isLoading, teams.length, router]);

  return {
    isLoading,
    error,
    hasTeams: teams.length > 0,
    currentTeam
  };
} 