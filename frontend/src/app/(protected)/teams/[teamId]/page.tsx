"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamMembers } from '@/components/team/TeamMembers';
import { TeamSettings } from '@/components/team/TeamSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamStore } from '@/store/teamStore';

export default function TeamPage() {
  const params = useParams();
  const { teams, fetchTeams, setCurrentTeam } = useTeamStore();
  const teamId = params.teamId as string;

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
    }
  }, [teams, teamId, setCurrentTeam]);

  const team = teams.find(t => t.id === teamId);
  if (!team) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{team.name}</h2>
        <p className="text-muted-foreground">
          Manage your team settings and members.
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <TeamMembers />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <TeamSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}