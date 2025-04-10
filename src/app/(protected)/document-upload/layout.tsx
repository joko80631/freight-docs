'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/store/team-store';
import { ErrorBoundary } from '@/components/error-boundary';
import { Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function UploadErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="container mx-auto py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">Upload Error</h3>
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

export default function DocumentUploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentTeam, isLoading: isTeamLoading } = useTeamStore();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      if (!isTeamLoading && !currentTeam?.id) {
        router.push('/teams/select');
      }
    };

    checkAuth();
  }, [currentTeam?.id, isTeamLoading, router, supabase.auth]);

  if (isTeamLoading) {
    return <LoadingFallback />;
  }

  if (!currentTeam?.id) {
    return <LoadingFallback />;
  }

  return (
    <ErrorBoundary FallbackComponent={UploadErrorFallback}>
      <div className="min-h-screen bg-background">
        <main className="flex-1">{children}</main>
      </div>
    </ErrorBoundary>
  );
} 