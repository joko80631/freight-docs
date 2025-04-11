'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTeamStore } from '../store/teamStore';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { safeArray } from '@/lib/array-utils';
import { TeamWithRole } from '@/types/team';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/verify-email', '/teams/new'] as const;

interface RequireTeamProps {
  children: ReactNode;
}

export function RequireTeam({ children }: RequireTeamProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentTeam, teams, isLoading, error, fetchTeams } = useTeamStore();

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname as typeof PUBLIC_PATHS[number])) {
      return;
    }
    fetchTeams();
  }, [pathname, fetchTeams]);

  // Don't block rendering on public paths
  if (PUBLIC_PATHS.includes(pathname as typeof PUBLIC_PATHS[number])) {
    return <>{children}</>;
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
            onClick={() => fetchTeams()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!currentTeam && teams.length > 0) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Select a Team</CardTitle>
          <CardDescription>
            Please select a team to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeArray(teams).map((team: TeamWithRole) => (
              <Button
                key={team.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Handle team selection
                  router.push(`/teams/${team.id}`);
                }}
              >
                {team.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
} 