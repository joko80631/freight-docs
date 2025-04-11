import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Team } from '@/types/team';
import { useToast } from './use-toast';

interface UseTeamSelectionOptions {
  redirectOnChange?: boolean;
  redirectPath?: string;
}

export function useTeamSelection(options: UseTeamSelectionOptions = {}) {
  const { redirectOnChange = true, redirectPath = '/dashboard' } = options;
  const router = useRouter();
  const toast = useToast();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial team selection from localStorage
    const savedTeamId = localStorage.getItem('selectedTeamId');
    if (savedTeamId) {
      // Fetch team details from API
      fetch(`/api/teams/${savedTeamId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSelectedTeam(data.data);
          }
        })
        .catch(error => {
          toast.error('Failed to load team', {
            description: error instanceof Error ? error.message : 'Unknown error occurred'
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [toast]);

  const selectTeam = useCallback(async (team: Team) => {
    try {
      setIsLoading(true);
      
      // Save selection to localStorage
      localStorage.setItem('selectedTeamId', team.id);
      setSelectedTeam(team);

      if (redirectOnChange) {
        router.push(redirectPath);
      }

      toast.success('Team selected', {
        description: `Switched to ${team.name}`
      });
    } catch (error) {
      toast.error('Failed to select team', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  }, [redirectOnChange, redirectPath, router, toast]);

  const clearSelection = useCallback(() => {
    localStorage.removeItem('selectedTeamId');
    setSelectedTeam(null);
  }, []);

  return {
    selectedTeam,
    selectTeam,
    clearSelection,
    isLoading
  };
} 