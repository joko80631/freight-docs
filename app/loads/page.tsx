'use client';

import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { LoadFilters } from '@/components/loads/LoadFilters';
import { LoadList } from '@/components/loads/LoadList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTeamStore } from '@/store/team-store';

export default function LoadsPage() {
  const router = useRouter();
  const { currentTeam } = useTeamStore();

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Load Management"
        description="Manage and track your freight loads"
      >
        <Button onClick={() => router.push('/loads/create')}>
          <Plus className="mr-2 h-4 w-4" />
          New Load
        </Button>
      </DashboardHeader>

      <LoadFilters />
      <LoadList />
    </div>
  );
} 