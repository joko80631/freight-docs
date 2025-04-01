'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useTeamStore from '../store/teamStore';

export function TeamSelector() {
  const { 
    teams, 
    teamId, 
    role, 
    isLoading, 
    error,
    loadTeams, 
    setTeamId, 
    setRole, 
    setTeams 
  } = useTeamStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log('TeamSelector: Starting team fetch');
        const response = await fetch('/api/teams');
        const data = await response.json();
        
        console.log('TeamSelector: API Response', {
          status: response.status,
          ok: response.ok,
          data
        });

        if (!response.ok) {
          throw new Error(data.details || data.error || 'Failed to fetch teams');
        }

        if (data.status === 'empty') {
          console.log('TeamSelector: No teams found, showing create prompt');
          setTeams([]);
          setIsCreateDialogOpen(true);
        } else {
          setTeams(data.teams);
        }
      } catch (error) {
        console.error('TeamSelector: Error fetching teams:', error);
        throw error;
      }
    };

    loadTeams(fetchTeams);
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setCreateError(null);
    
    try {
      console.log('TeamSelector: Creating team:', newTeamName);
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTeamName }),
      });

      const data = await response.json();
      console.log('TeamSelector: Create team response:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to create team');
      }

      const { team } = data;
      if (team) {
        setTeams([...teams, { ...team, role: 'ADMIN' }]);
        setTeamId(team.id);
        setRole('ADMIN');
        setNewTeamName('');
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('TeamSelector: Error creating team:', error);
      setCreateError(error.message);
    }
  };

  const handleTeamChange = (value) => {
    const selectedTeam = teams.find(team => team.id === value);
    if (selectedTeam) {
      setTeamId(value);
      setRole(selectedTeam.role);
    }
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Loading teams..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="loading">Loading...</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-red-500 text-sm">
          {error}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => loadTeams()}
          className="h-8 px-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          No teams found
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Your First Team</DialogTitle>
              <DialogDescription>
                Create a team to start collaborating with others.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                  required
                />
              </div>
              {createError && (
                <div className="text-sm text-red-500">
                  {createError}
                </div>
              )}
              <Button type="submit" className="w-full">
                Create Team
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
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
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                required
              />
            </div>
            {createError && (
              <div className="text-sm text-red-500">
                {createError}
              </div>
            )}
            <Button type="submit" className="w-full">
              Create Team
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 