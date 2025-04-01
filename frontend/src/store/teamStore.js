import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const useTeamStore = create(
  persist(
    (set, get) => ({
      teams: [],
      currentTeam: null,
      isLoading: false,
      error: null,

      fetchTeams: async () => {
        const supabase = createClientComponentClient();
        set({ isLoading: true, error: null });
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            set({ teams: [], isLoading: false });
            return;
          }
          
          const { data, error } = await supabase
            .from('teams')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          set({ teams: data, isLoading: false });
          
          // Set current team if not already set
          const { currentTeam } = get();
          if (!currentTeam && data.length > 0) {
            set({ currentTeam: data[0] });
          }
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      setCurrentTeam: (team) => {
        set({ currentTeam: team });
        localStorage.setItem('currentTeam', JSON.stringify(team));
      },

      createTeam: async (teamData) => {
        const supabase = createClientComponentClient();
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase
            .from('teams')
            .insert([teamData])
            .select()
            .single();
          
          if (error) throw error;
          
          set(state => ({
            teams: [data, ...state.teams],
            currentTeam: data,
            isLoading: false
          }));
          
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      clearTeams: () => {
        set({ teams: [], currentTeam: null });
      }
    }),
    {
      name: 'team-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 