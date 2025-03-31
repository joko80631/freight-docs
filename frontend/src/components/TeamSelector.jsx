import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import useTeamStore from '../store/teamStore';
import { useTeams } from '../hooks/useTeams';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TeamSelector() {
  const { teamId, teamName, role, setTeam } = useTeamStore();
  const { teams, createTeam, isLoading } = useTeams();
  const [newTeamName, setNewTeamName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTeamChange = (teamId) => {
    const selectedTeam = teams.find(team => team.id === teamId);
    if (selectedTeam) {
      setTeam(selectedTeam.id, selectedTeam.name, selectedTeam.role);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const newTeam = await createTeam(newTeamName);
      setTeam(newTeam.id, newTeam.name, newTeam.role);
      setNewTeamName('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading teams...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={teamId} onValueChange={handleTeamChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create Team
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {role && (
        <div className="text-sm text-gray-500">
          Role: {role}
        </div>
      )}
    </div>
  );
} 