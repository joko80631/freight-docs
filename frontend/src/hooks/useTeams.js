import { useEffect } from 'react';
import { useTeamStore } from '../store/teamStore';

export const useTeams = () => {
  const { 
    teams, 
    setTeams, 
    setLoading, 
    setError, 
    clearTeamState 
  } = useTeamStore();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams');
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }

      const data = await response.json();
      setTeams(data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name) => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to create team');
      }

      const newTeam = await response.json();
      setTeams([...teams, newTeam]);
      return newTeam;
    } catch (error) {
      setError(error.message);
      console.error('Error creating team:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    fetchTeams,
    createTeam,
    clearTeamState
  };
}; 