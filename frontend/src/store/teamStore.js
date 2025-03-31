import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTeamStore = create(
  persist(
    (set, get) => ({
      teams: [],
      teamId: null,
      role: null,
      teamName: null,
      isLoading: false,
      error: null,

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

      setTeamId: (teamId) => set({ teamId }),
      setRole: (role) => set({ role }),
      setTeam: (teamId, teamName, role) => {
        set({ teamId, teamName, role });
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      reset: () => {
        set({ 
          teams: [], 
          teamId: null, 
          role: null, 
          teamName: null, 
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