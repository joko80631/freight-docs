'use client';

import React, { useEffect } from 'react';
import { useTeamStore } from '@/store/teamStore';
import useDashboardStore from '@/store/dashboardStore';
import MetricCard from '@/components/dashboard/MetricCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import LoadTimeline from '@/components/dashboard/LoadTimeline';
import QuickActions from '@/components/dashboard/QuickActions';
import { Loader2, Package, FileText, Users, CheckCircle } from 'lucide-react';

const DashboardPage = () => {
  const { currentTeam } = useTeamStore();
  const { metrics, recentActivity, isLoading, error, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    if (currentTeam?.id) {
      fetchDashboardData(currentTeam.id);
      // Set up polling every 60 seconds
      const interval = setInterval(() => {
        fetchDashboardData(currentTeam.id);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [currentTeam?.id, fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error loading dashboard: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Loads"
          value={metrics.totalLoads}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description={`${metrics.activeLoads} active, ${metrics.completedLoads} completed`}
        />
        <MetricCard
          title="Document Status"
          value={metrics.documentStatus.pending}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          description={`${metrics.documentStatus.classified} classified, ${metrics.documentStatus.rejected} rejected`}
        />
        <MetricCard
          title="Team Activity"
          value={metrics.teamActivity.uploadsThisWeek}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Uploads this week"
        />
        <MetricCard
          title="Classification Accuracy"
          value={`${metrics.classificationAccuracy}%`}
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          description="AI classification success rate"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <LoadTimeline data={[]} /> {/* TODO: Add timeline data */}
        <ActivityFeed activities={recentActivity} />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default DashboardPage; 