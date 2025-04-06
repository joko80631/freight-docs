import { create } from "zustand";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { persist } from "zustand/middleware";

interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  role: 'owner' | 'admin' | 'member';
  member_count?: number;
}

interface TeamMembership {
  team_id: string;
  role: 'owner' | 'admin' | 'member';
  teams: Omit<Team, 'role'>;
}

interface TeamMembershipResponse {
  team_id: string;
  role: 'owner' | 'admin' | 'member';
  teams: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
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
        const { isLoading } = get();
        if (isLoading) return; // Prevent multiple simultaneous fetches

        set({ isLoading: true, error: null });
        try {
          const supabase = createClientComponentClient();
          
          // Check authentication first
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) throw new Error('Authentication required');
          if (!user) throw new Error('No authenticated user');

          // First ensure the user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!profile) {
            // Create profile if it doesn't exist
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name
              }]);

            if (createProfileError) throw createProfileError;
          }

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
                updated_at
              )
            `)
            .eq('user_id', user.id)
            .returns<TeamMembershipResponse[]>();

          if (membershipError) throw membershipError;

          if (!teamMemberships || teamMemberships.length === 0) {
            // Create a default team for the user if they don't have any
            const { data: defaultTeam, error: createTeamError } = await supabase
              .from('teams')
              .insert([{
                name: 'My Team'
              }])
              .select()
              .single();

            if (createTeamError) throw createTeamError;

            // Add the user as an owner of the default team
            const { error: addMemberError } = await supabase
              .from('team_members')
              .insert([{
                team_id: defaultTeam.id,
                user_id: user.id,
                role: 'owner'
              }]);

            if (addMemberError) throw addMemberError;

            // Set the teams array with the default team
            const teams: Team[] = [{
              ...defaultTeam,
              role: 'owner'
            }];

            set({ teams, currentTeam: teams[0], hasAttemptedLoad: true });
            return;
          }

          // Transform the data to match our Team interface
          const teams: Team[] = teamMemberships.map(membership => ({
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
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch teams',
            teams: [], // Clear teams on error
            currentTeam: null // Clear current team on error
          });
          // Clear persisted team data on auth error
          if (error instanceof Error && error.message === 'Authentication required') {
            localStorage.removeItem('currentTeamId');
          }
        } finally {
          set({ isLoading: false });
        }
      },

      createTeam: async (name) => {
        try {
          const supabase = createClientComponentClient();
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError) throw new Error('Authentication required');
          if (!user) throw new Error('No authenticated user');

          // Create the team
          const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert([{ name }])
            .select()
            .single();

          if (teamError) throw teamError;

          // Add the creator as an owner member
          const { error: memberError } = await supabase
            .from('team_members')
            .insert([{
              team_id: team.id,
              user_id: user.id,
              role: 'owner'
            }]);

          if (memberError) throw memberError;

          // Add role to the team object
          const teamWithRole: Team = { ...team, role: 'owner' };
          
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