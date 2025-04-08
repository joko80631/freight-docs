import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { persist } from 'zustand/middleware';
import { toast } from '@/components/ui/use-toast';

export type TeamRole = 'ADMIN' | 'MEMBER';

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TeamMember {
  user_id: string;
  role: TeamRole;
  profile: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface TeamWithRole extends Team {
  role: TeamRole;
  members?: TeamMember[];
}

interface TeamMembershipResponse {
  team_id: string;
  role: TeamRole;
  teams: Team;
}

interface TeamState {
  teams: TeamWithRole[];
  currentTeam: TeamWithRole | null;
  isLoading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<TeamWithRole | null>;
  setCurrentTeam: (team: TeamWithRole | null) => void;
  deleteTeam: (teamId: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => {
      const supabase = createClientComponentClient();

      return {
        teams: [],
        currentTeam: null,
        isLoading: false,
        error: null,

        fetchTeams: async () => {
          set({ isLoading: true, error: null });
          try {
            const { data: teamMemberships, error } = await supabase
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

            if (error) throw error;

            const teams = teamMemberships
              .filter(membership => membership.teams)
              .map(membership => ({
                ...membership.teams,
                role: membership.role
              }));

            set({ teams, isLoading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch teams';
            set({ error: errorMessage, isLoading: false });
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
        },

        createTeam: async (name: string) => {
          set({ isLoading: true, error: null });
          try {
            if (!name.trim()) {
              throw new Error('Team name is required');
            }

            const { data: team, error: teamError } = await supabase
              .from('teams')
              .insert([{ name: name.trim() }])
              .select()
              .single();

            if (teamError) throw teamError;

            const { error: memberError } = await supabase
              .from('team_members')
              .insert([{
                team_id: team.id,
                role: 'ADMIN'
              }]);

            if (memberError) throw memberError;

            const newTeam: TeamWithRole = {
              ...team,
              role: 'ADMIN'
            };

            set(state => ({
              teams: [...state.teams, newTeam],
              currentTeam: newTeam,
              isLoading: false
            }));

            toast({
              title: "Success",
              description: "Team created successfully",
            });
            return newTeam;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create team';
            set({ error: errorMessage, isLoading: false });
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
            return null;
          }
        },

        setCurrentTeam: (team: TeamWithRole | null) => {
          set({ currentTeam: team });
        },

        deleteTeam: async (teamId: string) => {
          set({ isLoading: true, error: null });
          try {
            const { error } = await supabase
              .from('teams')
              .delete()
              .eq('id', teamId);

            if (error) throw error;

            set(state => ({
              teams: state.teams.filter(team => team.id !== teamId),
              currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam,
              isLoading: false
            }));

            toast({
              title: "Success",
              description: "Team deleted successfully",
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete team';
            set({ error: errorMessage, isLoading: false });
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
        }
      };
    },
    {
      name: 'team-store',
    }
  )
); 