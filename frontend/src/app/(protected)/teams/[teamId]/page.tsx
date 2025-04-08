import { Suspense, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TeamMembersTable } from '@/components/team/TeamMembersTable';
import { TeamSettings } from '@/components/team/TeamSettings';
import { TeamActivity } from '@/components/team/TeamActivity';
import { useTeamStore } from '@/store/teamStore';
import { useToast } from '@/components/ui/use-toast';

interface TeamPageProps {
  params: {
    teamId: string;
  };
}

export default function TeamPage({ params }: TeamPageProps) {
  const { teams, currentTeam, fetchTeamMembers, fetchTeams } = useTeamStore();
  const { toast } = useToast();
  
  // Find the team in the store
  const team = teams.find(t => t.id === params.teamId) || currentTeam;
  
  // Fetch teams and team members when the component mounts
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        await fetchTeams();
        await fetchTeamMembers(params.teamId);
      } catch (error) {
        toast({
          title: "Error loading team",
          description: "Failed to load team data. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    loadTeamData();
  }, [params.teamId, fetchTeamMembers, fetchTeams, toast]);

  if (!team) {
    notFound();
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{team.name}</h1>
        <p className="text-muted-foreground">
          Manage your team members and settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <Suspense fallback={<MembersTableSkeleton />}>
              <TeamMembersTable
                teamId={team.id}
                currentUserRole={team.role}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="settings">
            <TeamSettings team={team} />
          </TabsContent>
        </Tabs>

        <div className="space-y-6">
          <Suspense fallback={<ActivitySkeleton />}>
            <TeamActivity teamId={team.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function MembersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 