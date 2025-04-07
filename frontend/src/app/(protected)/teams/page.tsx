'use client';

import { useEffect, useState } from 'react';
import { useTeamStore } from '@/store/team-store';
import { useAuth } from '@/hooks/useAuth';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/shared/EmptyState';
import { TeamMemberList } from '@/components/team/TeamMemberList';
import { CreateTeamDialog } from '@/components/team/CreateTeamDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  role: 'owner' | 'admin' | 'member';
  member_count?: number;
}

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'member';
}

export default function TeamsPage() {
  const { user } = useAuth();
  const { teams, fetchTeams } = useTeamStore();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchTeams();
    } catch (err) {
      setError('Failed to load teams');
      console.error('Error loading teams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const members = await useTeamStore.getState().fetchTeamMembers(teamId);
      setTeamMembers(members);
    } catch (err) {
      setError('Failed to load team members');
      console.error('Error loading team members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamCreated = (team: Team) => {
    setIsCreateDialogOpen(false);
    loadTeams();
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleMemberUpdate = () => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  };

  return (
    <PageContainer
      title="Teams"
      description="Manage your teams and team members"
      isLoading={isLoading}
      error={error}
      emptyState={
        teams.length === 0 && (
          <EmptyState
            icon={Plus}
            title="No teams yet"
            description="Create your first team to get started"
            action={
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            }
            variant="default"
            className="bg-background"
          />
        )
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teams.map((team) => (
                <Button
                  key={team.id}
                  variant={selectedTeam?.id === team.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => handleTeamSelect(team)}
                >
                  {team.name}
                </Button>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedTeam && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedTeam.name} Members</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamMemberList
                teamId={selectedTeam.id}
                members={teamMembers}
                currentUserRole={selectedTeam.role}
                onMemberUpdate={handleMemberUpdate}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <CreateTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTeamCreated={handleTeamCreated}
      />
    </PageContainer>
  );
} 