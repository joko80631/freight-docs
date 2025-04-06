"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTeamStore } from "@/store/team-store";
import { Skeleton } from "@/components/ui/skeleton";

interface WithTeamProtectionProps {
  children: React.ReactNode;
}

export function WithTeamProtection({ children }: WithTeamProtectionProps) {
  const { teams, currentTeam, isLoading, hasAttemptedLoad, fetchTeams } = useTeamStore();
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

  // Show loading state while teams are being fetched
  if (isLoading || !hasAttemptedLoad) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  // If no teams are available, don't render children
  if (teams.length === 0) {
    return null;
  }

  // If no current team is selected, don't render children
  if (!currentTeam) {
    return null;
  }

  return <>{children}</>;
} 