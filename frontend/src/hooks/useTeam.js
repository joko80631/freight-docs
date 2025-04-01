'use client';

import { useEffect, useState } from 'react';
import { useTeams } from './useTeams';
import { useAuth } from './useAuth';

export function useTeam() {
  const { user } = useAuth();
  const { teams, fetchTeams, loading: teamsLoading, error: teamsError } = useTeams();
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user, fetchTeams]);

  useEffect(() => {
    if (teams && teams.length > 0) {
      try {
        // Try to get the last selected team from localStorage
        const lastTeamId = localStorage.getItem('lastTeamId');
        const team = teams.find(t => t.id === lastTeamId) || teams[0];
        
        if (team) {
          setCurrentTeam(team);
          setIsAdmin(team.members?.some(m => m.user_id === user?.id && m.role === 'admin'));
        }
      } catch (error) {
        console.error('Error initializing team:', error);
        // Fallback to first team if there's an error
        if (teams.length > 0) {
          setCurrentTeam(teams[0]);
          setIsAdmin(teams[0].members?.some(m => m.user_id === user?.id && m.role === 'admin'));
        }
      }
      setIsInitialized(true);
    }
  }, [teams, user]);

  const switchTeam = (teamId) => {
    try {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        setCurrentTeam(team);
        setIsAdmin(team.members?.some(m => m.user_id === user?.id && m.role === 'admin'));
        localStorage.setItem('lastTeamId', teamId);
      }
    } catch (error) {
      console.error('Error switching team:', error);
    }
  };

  return {
    currentTeam,
    teams,
    isAdmin,
    switchTeam,
    isLoading: teamsLoading || !isInitialized,
    error: teamsError,
  };
} 