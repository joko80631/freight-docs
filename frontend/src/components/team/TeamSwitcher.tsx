"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeamStore, TeamWithRole } from '@/store/teamStore';
import { CreateTeamDialog } from './CreateTeamDialog';
import { routes } from '@/config/routes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TeamSwitcher() {
  const router = useRouter();
  const { teams, currentTeam, setCurrentTeam, fetchTeams } = useTeamStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleTeamSelect = (team: TeamWithRole) => {
    setCurrentTeam(team);
    router.push(routes.teams.detail(team.id));
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2"
          >
            {currentTeam?.name || 'Select Team'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              onClick={() => handleTeamSelect(team)}
            >
              {team.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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