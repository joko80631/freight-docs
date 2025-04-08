"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeamStore, TeamWithRole } from '@/store/teamStore';
import { CreateTeamDialog } from './CreateTeamDialog';

export function TeamSwitcher() {
  const router = useRouter();
  const { teams, currentTeam, setCurrentTeam, fetchTeams } = useTeamStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleTeamSelect = (team: TeamWithRole) => {
    setCurrentTeam(team);
    router.push(`/teams/${team.id}`);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Team
        </Button>
      </div>

      <div className="relative">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => {
            const dropdown = document.getElementById('team-dropdown');
            dropdown?.classList.toggle('hidden');
          }}
        >
          {currentTeam?.name || 'Select Team'}
          <ChevronDown className="h-4 w-4" />
        </Button>

        <div
          id="team-dropdown"
          className="hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="py-1">
            {teams.map((team) => (
              <button
                key={team.id}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleTeamSelect(team)}
              >
                {team.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CreateTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTeamCreated={(team) => {
          if (team) {
            handleTeamSelect(team);
          }
        }}
      />
    </div>
  );
} 