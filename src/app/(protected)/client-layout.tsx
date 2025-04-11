'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/store/team-store';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ErrorBoundary } from '@/components/error-boundary';
import { FallbackError } from '@/components/shared/FallbackError';
import { Loader2 } from 'lucide-react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentTeam, isLoading: isTeamLoading } = useTeamStore();

  useEffect(() => {
    if (!isTeamLoading && !currentTeam?.id) {
      router.push('/teams/select');
    }
  }, [isTeamLoading, currentTeam?.id, router]);

  if (isTeamLoading || !currentTeam?.id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={FallbackError}>
      <DashboardLayout>{children}</DashboardLayout>
    </ErrorBoundary>
  );
} 