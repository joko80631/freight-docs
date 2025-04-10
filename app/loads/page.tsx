'use client';

import { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LoadManagement from '../../components/load/LoadManagement';
import LoadFilters from '../../components/load/LoadFilters';
import { useTeamStore } from '@/src/store/team-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Load Management - Freight Document Platform',
  description: 'Manage and track your freight loads',
};

export default function LoadsPage() {
  const router = useRouter();
  const { currentTeam } = useTeamStore();

  const handleCreateLoad = () => {
    if (currentTeam?.id) {
      router.push('/loads/create');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
                <LoadFilters />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Loads</h2>
                  <Button
                    onClick={handleCreateLoad}
                    disabled={!currentTeam}
                    className="inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Load
                  </Button>
                </div>
                <LoadManagement />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 