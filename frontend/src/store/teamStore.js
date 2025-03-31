import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTeamStore = create(
  persist(
    (set, get) => ({
      teamId: null,
      teamName: null,
      role: null,
      teams: [],
      isLoading: false,
      error: null,

      setTeam: (teamId, teamName, role) => {
        set({ teamId, teamName, role });
      },

      setTeams: (teams) => {
        set({ teams });
        // If no team is selected and teams exist, select the first one
        if (!get().teamId && teams.length > 0) {
          const firstTeam = teams[0];
          set({ 
            teamId: firstTeam.id, 
            teamName: firstTeam.name, 
            role: firstTeam.role 
          });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      clearTeamState: () => {
        set({ 
          teamId: null, 
          teamName: null, 
          role: null, 
          teams: [], 
          error: null 
        });
      }
    }),
    {
      name: 'team-storage',
      partialize: (state) => ({ 
        teamId: state.teamId,
        teamName: state.teamName,
        role: state.role
      })
    }
  )
);

export default useTeamStore; 