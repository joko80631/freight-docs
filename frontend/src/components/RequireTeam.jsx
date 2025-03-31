import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useTeamStore from '../store/teamStore';
import { useTeams } from '../hooks/useTeams';

export function RequireTeam({ children }) {
  const router = useRouter();
  const { teamId, setTeam } = useTeamStore();
  const { teams, fetchTeams, isLoading } = useTeams();

  useEffect(() => {
    if (!teams.length) {
      fetchTeams();
    }
  }, [teams.length, fetchTeams]);

  useEffect(() => {
    if (!isLoading && !teams.length) {
      // If no teams exist, redirect to create team page or show create team dialog
      router.push('/create-team');
    }
  }, [isLoading, teams.length, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Please select a team to continue</div>
      </div>
    );
  }

  return children;
} 