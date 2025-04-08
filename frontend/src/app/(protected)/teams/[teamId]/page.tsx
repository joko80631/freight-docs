"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamMembers } from '@/components/team/TeamMembers';
import { TeamSettings } from '@/components/team/TeamSettings';
import { useTeamStore } from '@/store/teamStore';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamPage() {
  const params = useParams();
  const { teams, fetchTeams } = useTeamStore();
  const teamId = params.teamId as string;

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const team = teams.find(t => t.id === teamId);

  if (!team) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{team.name}</h1>
        <p className="text-muted-foreground">Manage your team settings and members</p>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <TeamMembers teamId={teamId} />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <TeamSettings teamId={teamId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 