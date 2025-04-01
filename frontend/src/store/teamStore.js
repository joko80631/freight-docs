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
      hasAttemptedLoad: false,

      setTeams: (teams) => {
        set({ 
          teams,
          hasAttemptedLoad: true,
          error: null
        });
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
      setError: (error) => set({ 
        error,
        isLoading: false,
        hasAttemptedLoad: true
      }),

      reset: () => {
        set({ 
          teams: [], 
          teamId: null, 
          role: null, 
          teamName: null, 
          error: null,
          hasAttemptedLoad: false
        });
      },

      // New method to handle team loading
      loadTeams: async () => {
        if (get().isLoading || (get().hasAttemptedLoad && !get().error)) return;
        
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/teams');
          if (!response.ok) {
            throw new Error('Failed to fetch teams');
          }
          const data = await response.json();
          if (data.teams) {
            get().setTeams(data.teams);
          } else {
            get().setTeams([]);
          }
        } catch (error) {
          set({ 
            error: error.message,
            isLoading: false,
            hasAttemptedLoad: true
          });
        }
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