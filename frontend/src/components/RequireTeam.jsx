'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTeamStore } from '../store/teamStore';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { safeArray } from '@/lib/utils';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/verify-email', '/teams/new'];

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

  // If no teams, show create team prompt
  if (teams.length === 0) {
    return (
      <div className="container max-w-lg mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Freight Management</CardTitle>
            <CardDescription>
              To get started, you need to create or join a team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => router.push('/teams/new')}
            >
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If teams exist but none selected, show team selector
  if (!teamId) {
    return (
      <div className="container max-w-lg mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Select a Team</CardTitle>
            <CardDescription>
              Choose a team to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeArray(teams).map((team) => (
                <Button
                  key={team.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    useTeamStore.getState().setTeam(team.id, team.name, team.role);
                    router.push('/loads');
                  }}
                >
                  {team.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
} 