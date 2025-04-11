'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTeams } from './useTeams';
import { useAuth } from './useAuth';

export function useTeam() {
  const { user } = useAuth();
  const { teams, fetchTeams, loading: teamsLoading, error: teamsError } = useTeams();
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Memoize the team initialization logic
  const initializeTeam = useCallback(() => {
    if (!teams || teams.length === 0) return;

    try {
      const lastTeamId = localStorage.getItem('lastTeamId');
      const team = teams.find(t => t.id === lastTeamId) || teams[0];
      
      if (team) {
        setCurrentTeam(team);
        setIsAdmin(team.members?.some(m => m.user_id === user?.id && m.role === 'admin'));
      }
    } catch (error) {
      console.error('Error initializing team:', error);
      setError(error);
      // Fallback to first team if there's an error
      if (teams.length > 0) {
        setCurrentTeam(teams[0]);
        setIsAdmin(teams[0].members?.some(m => m.user_id === user?.id && m.role === 'admin'));
      }
    }
  }, [teams, user]);

  // Fetch teams only when user changes
  useEffect(() => {
    if (user && !teams) {
      fetchTeams();
    }
  }, [user, teams, fetchTeams]);

  // Initialize team when teams data changes
  useEffect(() => {
    if (teams && !isInitialized) {
      initializeTeam();
      setIsInitialized(true);
    }
  }, [teams, isInitialized, initializeTeam]);

  const switchTeam = useCallback((teamId) => {
    try {
      const team = teams?.find(t => t.id === teamId);
      if (team) {
        setCurrentTeam(team);
        setIsAdmin(team.members?.some(m => m.user_id === user?.id && m.role === 'admin'));
        localStorage.setItem('lastTeamId', teamId);
      }
    } catch (error) {
      console.error('Error switching team:', error);
      setError(error);
    }
  }, [teams, user]);

  return {
    currentTeam,
    teams,
    isAdmin,
    switchTeam,
    isLoading: teamsLoading || !isInitialized,
    error: error || teamsError,
  };
} 