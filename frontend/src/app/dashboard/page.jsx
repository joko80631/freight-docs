'use client';

import { useTeamStore } from '@/store/teamStore';
import { useUserStore } from '@/store/userStore';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MetricCards from '@/components/dashboard/MetricCards';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import QuickActions from '@/components/dashboard/QuickActions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { currentTeam } = useTeamStore();
  const { user } = useUserStore();

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to view your dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  if (!currentTeam) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Context */}
      <DashboardHeader user={user} team={currentTeam} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Metric Cards */}
      <MetricCards teamId={currentTeam.id} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline - Takes up 2/3 of the space */}
        <div className="lg:col-span-2">
          <ActivityTimeline teamId={currentTeam.id} />
        </div>
      </div>
    </div>
  );
} 