// Server-side layout for session check
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ClientLayout } from './client-layout';
import { TeamSelectionModal } from '@/components/teams/TeamSelectionModal';
import { useTeamStore } from '@/store/team-store';
import { useEffect } from 'react';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const { currentTeam, fetchTeams } = useTeamStore();

  if (!session) {
    redirect('/login');
  }

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <>
      <TeamSelectionModal />
      {currentTeam ? <ClientLayout>{children}</ClientLayout> : null}
    </>
  );
} 