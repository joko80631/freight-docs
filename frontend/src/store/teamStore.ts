import { create } from 'zustand';
import { createBrowserClient } from '@supabase/ssr';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { Team, TeamMember, TeamRole } from '@/types/team';
import { showToast } from '@/lib/toast';

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
  members: TeamMember[];
  isFetching: boolean;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<TeamWithRole | null>;
  setCurrentTeam: (team: TeamWithRole | null) => void;
  deleteTeam: (teamId: string) => Promise<void>;
  updateTeamMember: (teamId: string, userId: string, data: { role: TeamRole }) => Promise<void>;
  removeTeamMember: (teamId: string, userId: string) => Promise<void>;
  fetchTeamMembers: (teamId: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      return {
        teams: [],
        currentTeam: null,
        isLoading: false,
        error: null,
        members: [],
        isFetching: false,

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
                role: membership.role,
                members: []
              }));

            set({ teams, isLoading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch teams';
            set({ error: errorMessage, isLoading: false });
            showToast.error('Error', errorMessage);
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
              role: 'ADMIN',
              members: []
            };

            set(state => ({
              teams: [...state.teams, newTeam],
              currentTeam: newTeam,
              isLoading: false
            }));

            showToast.success('Success', 'Team created successfully');
            return newTeam;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create team';
            set({ error: errorMessage, isLoading: false });
            showToast.error('Error', errorMessage);
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

            showToast.success('Success', 'Team deleted successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete team';
            set({ error: errorMessage, isLoading: false });
            showToast.error('Error', errorMessage);
          }
        },

        updateTeamMember: async (teamId: string, userId: string, data: { role: TeamRole }) => {
          set({ isLoading: true, error: null });
          try {
            const { error } = await supabase
              .from('team_members')
              .update({ role: data.role })
              .eq('team_id', teamId)
              .eq('user_id', userId);

            if (error) throw error;

            set(state => {
              const updatedMembers = state.members.map(member =>
                member.user_id === userId ? { ...member, role: data.role } : member
              );

              const updatedTeams = state.teams.map(team => {
                if (team.id === teamId) {
                  return {
                    ...team,
                    members: team.members?.map(member =>
                      member.user_id === userId ? { ...member, role: data.role } : member
                    ) || []
                  };
                }
                return team;
              });

              const updatedCurrentTeam = state.currentTeam?.id === teamId
                ? {
                    ...state.currentTeam,
                    members: state.currentTeam.members?.map(member =>
                      member.user_id === userId ? { ...member, role: data.role } : member
                    ) || []
                  }
                : state.currentTeam;

              return {
                members: updatedMembers,
                teams: updatedTeams,
                currentTeam: updatedCurrentTeam,
                isLoading: false
              };
            });

            showToast.success('Success', 'Team member updated successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update team member';
            set({ error: errorMessage, isLoading: false });
            showToast.error('Error', errorMessage);
          }
        },

        removeTeamMember: async (teamId: string, userId: string) => {
          set({ isLoading: true, error: null });
          try {
            const { error } = await supabase
              .from('team_members')
              .delete()
              .eq('team_id', teamId)
              .eq('user_id', userId);

            if (error) throw error;

            set(state => {
              const updatedTeams = state.teams.map(team => {
                if (team.id === teamId) {
                  return {
                    ...team,
                    members: team.members?.filter(member => member.user_id !== userId) || []
                  };
                }
                return team;
              });

              return {
                teams: updatedTeams,
                isLoading: false
              };
            });

            showToast.success('Success', 'Team member removed successfully');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove team member';
            set({ error: errorMessage, isLoading: false });
            showToast.error('Error', errorMessage);
          }
        },

        fetchTeamMembers: async (teamId: string) => {
          set({ isFetching: true, error: null });
          try {
            const { data: teamMembers, error } = await supabase
              .from('team_members')
              .select(`
                user_id,
                role,
                profile:profiles!inner (
                  full_name,
                  email,
                  avatar_url
                )
              `)
              .eq('team_id', teamId);

            if (error) throw error;

            const typedMembers: TeamMember[] = teamMembers.map(member => ({
              user_id: member.user_id,
              team_id: teamId,
              role: member.role as TeamRole,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              profile: {
                full_name: member.profile?.[0]?.full_name || '',
                email: member.profile?.[0]?.email || '',
                avatar_url: member.profile?.[0]?.avatar_url || ''
              }
            }));

            set(state => {
              const updatedTeams = state.teams.map(team => {
                if (team.id === teamId) {
                  return {
                    ...team,
                    members: typedMembers
                  };
                }
                return team;
              });

              return {
                teams: updatedTeams,
                isFetching: false
              };
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team members';
            set({ error: errorMessage, isFetching: false });
            showToast.error('Error', errorMessage);
          }
        }
      };
    },
    {
      name: 'team-store',
    }
  )
); 