'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useTeamStore from '../store/teamStore';
import { Button } from './ui/button';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/verify-email'];

export function RequireTeam({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { teamId, teams, isLoading, error, loadTeams } = useTeamStore();

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      return;
    }
    loadTeams();
  }, [pathname, loadTeams]);

  // Don't block rendering on public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Failed to Load Teams</h2>
        <p className="text-muted-foreground">{error}</p>
        <div className="space-x-4">
          <Button
            variant="ghost"
            onClick={() => {
              router.push('/');
              router.refresh();
            }}
          >
            Return to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => loadTeams()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold">No Teams Found</h2>
        <p className="text-muted-foreground">
          You need to be a member of a team to access this page.
        </p>
        <Button
          variant="ghost"
          onClick={() => {
            router.push('/');
            router.refresh();
          }}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  if (!teamId && teams.length > 0) {
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