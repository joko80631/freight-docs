'use client';

import { useEffect } from 'react';
import { ClientLayout } from './client-layout';
import { TeamSelectionModal } from '@/components/teams/TeamSelectionModal';
import { useTeamStore } from '@/store/team-store';

export function ProtectedClientLayout({ children }: { children: React.ReactNode }) {
  const { currentTeam, fetchTeams } = useTeamStore();

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