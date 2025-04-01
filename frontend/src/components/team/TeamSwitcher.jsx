import React from 'react';
import { useTeamStore } from '@/store/teamStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TeamSwitcher = () => {
  const { teams, currentTeam, setCurrentTeam } = useTeamStore();
  const router = useRouter();

  if (!teams?.length) {
    return (
      <Button onClick={() => router.push('/teams/new')}>
        <Plus className="mr-2 h-4 w-4" />
        Create Team
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={currentTeam?.id}
        onValueChange={(teamId) => {
          const team = teams.find(t => t.id === teamId);
          if (team) {
            setCurrentTeam(team);
          }
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={() => router.push('/teams/new')}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TeamSwitcher; 