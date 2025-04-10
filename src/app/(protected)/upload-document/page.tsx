'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTeamStore } from '@/store/team-store';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DocumentUploadPage() {
  const router = useRouter();
  const { currentTeam, isLoading: isTeamLoading } = useTeamStore();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Only redirect for team selection after confirming we have a session
      if (!isTeamLoading && !currentTeam?.id) {
        router.push('/teams/select');
      }
    };

    checkSession();
  }, [currentTeam?.id, isTeamLoading, router, supabase.auth]);

  if (isTeamLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!currentTeam?.id) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">No Team Selected</h3>
          <p className="text-slate-500 mt-1">
            Please select a team to upload documents.
          </p>
          <Button
            onClick={() => router.push('/teams/select')}
            className="mt-4"
          >
            Select Team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Upload Document</h1>
          <p className="text-muted-foreground">
            Upload and classify your freight documents
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <DocumentUpload />
      </div>
    </div>
  );
} 