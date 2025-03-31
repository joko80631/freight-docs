'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useTeamStore from '../store/teamStore';

export function RequireTeam({ children }) {
  const router = useRouter();
  const { teamId, teams, setTeams } = useTeamStore();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        if (data.teams) {
          setTeams(data.teams);
        } else {
          setTeams([]);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeams([]);
      }
    };

    if (!teams || teams.length === 0) {
      fetchTeams();
    }
  }, [teams, setTeams]);

  if (!teams) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (teams.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold">No Teams Found</h2>
        <p className="text-muted-foreground">
          You need to be a member of a team to access this page.
        </p>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-primary hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold">Select a Team</h2>
        <p className="text-muted-foreground">
          Please select a team to continue.
        </p>
      </div>
    );
  }

  return children;
} 