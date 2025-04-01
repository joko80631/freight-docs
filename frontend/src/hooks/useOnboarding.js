import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/store/teamStore';

export function useOnboarding() {
  const router = useRouter();
  const { teams, teamId, loadTeams, isLoading, hasAttemptedLoad } = useTeamStore();

  useEffect(() => {
    const handleOnboarding = async () => {
      // Only proceed if we've attempted to load teams
      if (!hasAttemptedLoad) {
        await loadTeams();
      }

      // If still loading, wait
      if (isLoading) {
        return;
      }

      // If no teams, redirect to team creation
      if (teams.length === 0) {
        router.push('/teams/new');
        return;
      }

      // If one team and no team selected, select it
      if (teams.length === 1 && !teamId) {
        const team = teams[0];
        useTeamStore.getState().setTeam(team.id, team.name, team.role);
        router.push('/loads');
        return;
      }

      // If multiple teams and no team selected, show team selector
      // (this is handled by the TeamSelector component)
    };

    handleOnboarding();
  }, [teams, teamId, loadTeams, isLoading, hasAttemptedLoad, router]);

  return {
    isLoading,
    hasAttemptedLoad,
    teams,
    teamId
  };
} 