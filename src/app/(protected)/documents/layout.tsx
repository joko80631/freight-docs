'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/store/team-store';
import { ErrorBoundary } from '@/components/error-boundary';
import { Loader2 } from 'lucide-react';

function DocumentsErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="container mx-auto py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
        <p className="text-red-600 mt-1">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentTeam, isLoading: isTeamLoading } = useTeamStore();

  useEffect(() => {
    // Only redirect after team loading is complete and we know there's no team
    if (!isTeamLoading && !currentTeam?.id) {
      router.push('/teams/select');
    }
  }, [currentTeam?.id, isTeamLoading, router]);

  // Show loading state while team data is being fetched
  if (isTeamLoading) {
    return <LoadingFallback />;
  }

  // Don't render children until we have a team
  if (!currentTeam?.id) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary FallbackComponent={DocumentsErrorFallback}>
      <div className="min-h-screen bg-background">
        <main className="flex-1">{children}</main>
      </div>
    </ErrorBoundary>
  );
} 