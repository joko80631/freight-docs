'use client';

import React, { useState, useEffect } from 'react';
import { useTeamStore } from '@/store/teamStore';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, ChevronDown, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';

const TeamSelector = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    teams, 
    currentTeam,
    isLoading,
    error,
    fetchTeams,
    setCurrentTeam
  } = useTeamStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        await fetchTeams();
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        toast({
          title: "Error",
          description: "Failed to load teams",
          variant: "destructive",
        });
      }
    };

    loadTeams();
  }, [fetchTeams, toast]);

  const handleTeamSelect = async (team) => {
    try {
      await setCurrentTeam(team);
      setIsOpen(false);
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

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => router.push('/teams/new')}
      >
        <Users className="h-4 w-4 mr-2" />
        Create Team
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Users className="h-4 w-4 mr-2" />
          {currentTeam?.name || 'Select Team'}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => handleTeamSelect(team)}
            className={currentTeam?.id === team.id ? 'bg-accent' : ''}
          >
            <Users className="h-4 w-4 mr-2" />
            {team.name}
            {currentTeam?.id === team.id && (
              <span className="ml-auto text-xs text-muted-foreground">
                Current
              </span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false);
            router.push('/teams/new');
          }}
        >
          <Users className="h-4 w-4 mr-2" />
          Create New Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TeamSelector; 