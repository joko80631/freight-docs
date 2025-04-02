'use client';

import React, { useEffect, useState } from 'react';
import { useTeamStore } from '@/store/teamStore';
import { Button } from "@/components/ui/button";
import { Users, Plus, Settings } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Skeleton from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';
import { useRouter } from 'next/navigation';

const TeamsPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    teams, 
    currentTeam,
    isLoading,
    error,
    fetchTeams,
    setCurrentTeam,
    createTeam,
    updateTeam,
    deleteTeam
  } = useTeamStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        await fetchTeams();
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        toast({
          title: "Error",
          description: "Failed to load teams",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, [fetchTeams, toast]);

  const handleCreateTeam = () => {
    router.push('/teams/new');
  };

  const handleSwitchTeam = async (team) => {
    try {
      await setCurrentTeam(team);
      toast({
        title: "Success",
        description: `Switched to ${team.name}`,
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch team",
        variant: "destructive",
      });
    }
  };

  const handleManageTeam = (team) => {
    // TODO: Implement team management
    toast({
      title: "Coming Soon",
      description: "Team management features will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={Users}
          title="No teams found"
          description="You haven't joined or created any teams yet."
          cta={{
            label: 'Create Team',
            onClick: handleCreateTeam
          }}
          variant="centered"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <Button onClick={handleCreateTeam}>
          <Plus className="mr-2 h-4 w-4" />
          New Team
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card 
            key={team.id}
            className={currentTeam?.id === team.id ? 'border-primary' : ''}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {team.name}
                {currentTeam?.id === team.id && (
                  <span className="text-sm text-primary">Current Team</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  {team.member_count || 0} members
                </p>
                <div className="flex gap-2 mt-2">
                  {currentTeam?.id !== team.id && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSwitchTeam(team)}
                    >
                      Switch to Team
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleManageTeam(team)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamsPage; 