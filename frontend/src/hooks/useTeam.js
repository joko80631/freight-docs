'use client';

import { useEffect, useState } from 'react';
import { useTeams } from './useTeams';
import { useAuth } from './useAuth';

export function useTeam() {
  const { user } = useAuth();
  const { teams, fetchTeams } = useTeams();
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user, fetchTeams]);

  useEffect(() => {
    if (teams && teams.length > 0) {
      // Try to get the last selected team from localStorage
      const lastTeamId = localStorage.getItem('lastTeamId');
      const team = teams.find(t => t.id === lastTeamId) || teams[0];
      setCurrentTeam(team);
      setIsAdmin(team.members?.some(m => m.user_id === user?.id && m.role === 'admin'));
    }
  }, [teams, user]);

  const switchTeam = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
      setIsAdmin(team.members?.some(m => m.user_id === user?.id && m.role === 'admin'));
      localStorage.setItem('lastTeamId', teamId);
    }
  };

  return {
    currentTeam,
    teams,
    isAdmin,
    switchTeam,
  };
} 