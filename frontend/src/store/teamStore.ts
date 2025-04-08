import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { persist } from 'zustand/middleware';

export type TeamRole = 'ADMIN' | 'MEMBER';

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TeamWithRole extends Team {
  role: TeamRole;
}

interface TeamMembershipResponse {
  team_id: string;
  role: TeamRole;
  teams: Team;
}

interface TeamStore {
  teams: TeamWithRole[];
  currentTeam: TeamWithRole | null;
  isLoading: boolean;
  error: string | null;
  hasAttemptedLoad: boolean;
  setCurrentTeam: (team: TeamWithRole | null) => void;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<TeamWithRole>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  reset: () => void;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      teams: [],
      currentTeam: null,
      isLoading: false,
      error: null,
      hasAttemptedLoad: false,

      setCurrentTeam: (team) => {
        set({ currentTeam: team });
        if (team) {
          localStorage.setItem('currentTeamId', team.id);
        } else {
          localStorage.removeItem('currentTeamId');
        }
      },

      fetchTeams: async () => {
        const { isLoading } = get();
        if (isLoading) return;

        set({ isLoading: true, error: null });
        const supabase = createClientComponentClient();

        try {
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
            .returns<TeamMembershipResponse[]>();

          if (membershipError) throw membershipError;

          if (!teamMemberships || teamMemberships.length === 0) {
            set({ teams: [], isLoading: false, hasAttemptedLoad: true });
            return;
          }

          const teams: TeamWithRole[] = teamMemberships
            .filter(tm => tm.teams)
            .map(tm => ({
              ...tm.teams,
              role: tm.role
            }));

          set({ teams, hasAttemptedLoad: true });

          // Set current team if not already set
          const { currentTeam } = get();
          const savedTeamId = localStorage.getItem('currentTeamId');
          
          if (!currentTeam) {
            const teamToSet = savedTeamId 
              ? teams.find(t => t.id === savedTeamId)
              : teams[0];
            
            if (teamToSet) {
              get().setCurrentTeam(teamToSet);
            }
          }
        } catch (error) {
          console.error('Error fetching teams:', error);
          set({ error: 'Failed to fetch teams' });
        } finally {
          set({ isLoading: false });
        }
      },

      createTeam: async (name) => {
        set({ isLoading: true, error: null });
        const supabase = createClientComponentClient();

        try {
          // Create the team
          const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert([{ name }])
            .select()
            .single();

          if (teamError) throw teamError;

          // The trigger will automatically add the creator as admin
          // Fetch the updated teams to get the new team with role
          await get().fetchTeams();

          // Find the newly created team in the updated list
          const { teams } = get();
          const newTeam = teams.find(t => t.id === team.id);

          if (!newTeam) {
            throw new Error('Failed to fetch created team');
          }

          // Set as current team
          get().setCurrentTeam(newTeam);

          return newTeam;
        } catch (error) {
          console.error('Error creating team:', error);
          set({ error: 'Failed to create team' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateTeam: async (teamId, updates) => {
        set({ isLoading: true, error: null });
        const supabase = createClientComponentClient();

        try {
          const { error } = await supabase
            .from('teams')
            .update(updates)
            .eq('id', teamId);

          if (error) throw error;

          // Refresh teams to get updated data
          await get().fetchTeams();
        } catch (error) {
          console.error('Error updating team:', error);
          set({ error: 'Failed to update team' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteTeam: async (teamId) => {
        set({ isLoading: true, error: null });
        const supabase = createClientComponentClient();

        try {
          const { error } = await supabase
            .from('teams')
            .delete()
            .eq('id', teamId);

          if (error) throw error;

          const { currentTeam, teams } = get();
          const updatedTeams = teams.filter(t => t.id !== teamId);
          
          set({ teams: updatedTeams });

          if (currentTeam?.id === teamId) {
            get().setCurrentTeam(updatedTeams[0] || null);
          }
        } catch (error) {
          console.error('Error deleting team:', error);
          set({ error: 'Failed to delete team' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => {
        set({
          teams: [],
          currentTeam: null,
          isLoading: false,
          error: null,
          hasAttemptedLoad: false
        });
        localStorage.removeItem('currentTeamId');
      }
    }),
    {
      name: 'team-store',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const data = JSON.parse(str);
            // Ensure role values are correct
            if (data.state?.teams) {
              data.state.teams = data.state.teams.map((team: TeamWithRole) => ({
                ...team,
                role: team.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
              }));
            }
            if (data.state?.currentTeam) {
              data.state.currentTeam.role = 
                data.state.currentTeam.role === 'ADMIN' ? 'ADMIN' : 'MEMBER';
            }
            return data;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
); 