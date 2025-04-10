'use client';

import { useRouter } from 'next/navigation';
import { CreateTeamDialog } from '@/components/team/CreateTeamDialog';
import { TeamWithRole } from '@/store/teamStore';

export default function NewTeamPage() {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push('/teams');
    }
  };

  const handleTeamCreated = (team: TeamWithRole | null) => {
    if (team) {
      router.push(`/teams/${team.id}`);
    }
  };

  return (
    <div className="container py-6">
      <CreateTeamDialog 
        open={true} 
        onOpenChange={handleOpenChange}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
} 