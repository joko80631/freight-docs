import { create } from "zustand";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { persist } from "zustand/middleware";

interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  role: 'admin' | 'member' | 'viewer';
  member_count?: number;
}

interface TeamMembership {
  team_id: string;
  role: 'admin' | 'member' | 'viewer';
  teams: Omit<Team, 'role'>;
}

interface TeamStore {
  currentTeam: Team | null;
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  hasAttemptedLoad: boolean;
  setCurrentTeam: (team: Team | null) => void;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  reset: () => void;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      currentTeam: null,
      teams: [],
      isLoading: false,
      error: null,
      hasAttemptedLoad: false,

      setCurrentTeam: (team) => {
        set({ currentTeam: team });
        // Persist the current team ID in localStorage
        if (team) {
          localStorage.setItem('currentTeamId', team.id);
        } else {
          localStorage.removeItem('currentTeamId');
        }
      },

      fetchTeams: async () => {
        set({ isLoading: true, error: null });
        try {
          const supabase = createClientComponentClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) throw new Error('No user found');

          // Fetch teams where user is a member
          const { data: teamMemberships, error: membershipError } = await supabase
            .from('team_members')
            .select(`
              team_id,
              role,
              teams (
                id,
                name,
                created_at,
                updated_at,
                created_by
              )
            `)
            .eq('user_id', user.id)
            .returns<TeamMembership[]>();

          if (membershipError) throw membershipError;

          // Transform the data to match our Team interface
          const teams: Team[] = (teamMemberships || []).map(membership => ({
            ...membership.teams,
            role: membership.role
          }));

          set({ teams, hasAttemptedLoad: true });

          // Set current team if not already set
          const { currentTeam } = get();
          if (!currentTeam && teams.length > 0) {
            // Try to restore from localStorage first
            const savedTeamId = localStorage.getItem('currentTeamId');
            const savedTeam = teams.find(t => t.id === savedTeamId);
            
            if (savedTeam) {
              set({ currentTeam: savedTeam });
            } else {
              set({ currentTeam: teams[0] });
            }
          }
        } catch (error) {
          console.error('Error fetching teams:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch teams' });
        } finally {
          set({ isLoading: false });
        }
      },

      createTeam: async (name) => {
        try {
          const supabase = createClientComponentClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) throw new Error('No user found');

          // Create the team
          const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert([{ name, created_by: user.id }])
            .select()
            .single();

          if (teamError) throw teamError;

          // Add the creator as an admin member
          const { error: memberError } = await supabase
            .from('team_members')
            .insert([{
              team_id: team.id,
              user_id: user.id,
              role: 'admin'
            }]);

          if (memberError) throw memberError;

          // Add role to the team object
          const teamWithRole: Team = { ...team, role: 'admin' };
          
          set((state) => ({
            teams: [...state.teams, teamWithRole],
            currentTeam: teamWithRole
          }));

          return teamWithRole;
        } catch (error) {
          console.error('Error creating team:', error);
          throw error;
        }
      },

      updateTeam: async (teamId, updates) => {
        try {
          const supabase = createClientComponentClient();
          const { data: team, error } = await supabase
            .from('teams')
            .update(updates)
            .eq('id', teamId)
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            teams: state.teams.map((t) => t.id === teamId ? { ...team, role: t.role } : t),
            currentTeam: state.currentTeam?.id === teamId ? { ...team, role: state.currentTeam.role } : state.currentTeam
          }));
        } catch (error) {
          console.error('Error updating team:', error);
          throw error;
        }
      },

      deleteTeam: async (teamId) => {
        try {
          const supabase = createClientComponentClient();
          const { error } = await supabase
            .from('teams')
            .delete()
            .eq('id', teamId);

          if (error) throw error;

          set((state) => ({
            teams: state.teams.filter((t) => t.id !== teamId),
            currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam
          }));
        } catch (error) {
          console.error('Error deleting team:', error);
          throw error;
        }
      },

      reset: () => {
        set({
          currentTeam: null,
          teams: [],
          isLoading: false,
          error: null,
          hasAttemptedLoad: false
        });
        localStorage.removeItem('currentTeamId');
      }
    }),
    {
      name: 'team-storage',
      partialize: (state) => ({
        currentTeam: state.currentTeam,
        teams: state.teams
      })
    }
  )
); 