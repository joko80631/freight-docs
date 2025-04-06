import { useEffect } from 'react';
import { useTeamStore } from '@/store/team-store';
import { useRouter } from 'next/navigation';

export function useTeamInitializer() {
  const { fetchTeams, teams, currentTeam, isLoading, hasAttemptedLoad, error } = useTeamStore();
  const router = useRouter();

  useEffect(() => {
    if (!hasAttemptedLoad && !isLoading) {
      fetchTeams();
    }
  }, [fetchTeams, hasAttemptedLoad, isLoading]);

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