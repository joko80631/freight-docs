import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import {
  Team,
  TeamMember,
  TeamRole,
  TeamWithRole,
  CreateTeamPayload,
  UpdateTeamPayload,
  AddTeamMemberPayload,
  UpdateTeamMemberPayload,
} from '@/types/team';

interface TeamState {
  teams: TeamWithRole[];
  currentTeam: TeamWithRole | null;
  members: TeamMember[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isFetching: boolean;
  error: string | null;
  
  // Team actions
  fetchTeams: () => Promise<void>;
  createTeam: (payload: CreateTeamPayload) => Promise<TeamWithRole | null>;
  updateTeam: (teamId: string, payload: UpdateTeamPayload) => Promise<TeamWithRole | null>;
  deleteTeam: (teamId: string) => Promise<boolean>;
  setCurrentTeam: (teamId: string | null) => void;
  
  // Team member actions
  fetchTeamMembers: (teamId: string) => Promise<void>;
  addTeamMember: (teamId: string, payload: AddTeamMemberPayload) => Promise<boolean>;
  updateTeamMember: (teamId: string, userId: string, payload: UpdateTeamMemberPayload) => Promise<boolean>;
  removeTeamMember: (teamId: string, userId: string) => Promise<boolean>;
}

const supabase = createClientComponentClient();

interface TeamMembershipResponse {
  team_id: string;
  role: TeamRole;
  teams: Team;
}

interface TeamMemberResponse {
  team_id: string;
  user_id: string;
  role: TeamRole;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: [],
      currentTeam: null,
      members: [],
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isFetching: false,
      error: null,

      fetchTeams: async () => {
        try {
          set({ isFetching: true, error: null });
          
          const { data: memberships, error: membershipError } = await supabase
            .from('team_members')
            .select(`
              team_id,
              role,
              teams:team_id (
                id,
                name,
                created_at,
                updated_at,
                created_by
              )
            `)
            .returns<TeamMembershipResponse[]>()
            .throwOnError();

          if (membershipError) throw membershipError;

          const teamsWithRoles: TeamWithRole[] = memberships
            .filter(m => m.teams) // Filter out null teams
            .map(m => ({
              ...m.teams,
              role: m.role
            }));

          set({ teams: teamsWithRoles });
          
          // Set first team as current if none selected
          if (!get().currentTeam && teamsWithRoles.length > 0) {
            set({ currentTeam: teamsWithRoles[0] });
          }
        } catch (error) {
          set({ error: 'Failed to fetch teams' });
          toast.error('Failed to fetch teams');
        } finally {
          set({ isFetching: false });
        }
      },

      createTeam: async (payload) => {
        try {
          set({ isCreating: true, error: null });

          const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert({
              name: payload.name,
            })
            .select()
            .single()
            .throwOnError();

          if (teamError) throw teamError;

          // The trigger will automatically add the creator as admin
          await get().fetchTeams();
          
          toast.success('Team created successfully');
          return team as TeamWithRole;
        } catch (error) {
          set({ error: 'Failed to create team' });
          toast.error('Failed to create team');
          return null;
        } finally {
          set({ isCreating: false });
        }
      },

      updateTeam: async (teamId, payload) => {
        try {
          set({ isUpdating: true, error: null });

          const { data: team, error: teamError } = await supabase
            .from('teams')
            .update({
              name: payload.name,
              updated_at: new Date().toISOString(),
            })
            .eq('id', teamId)
            .select()
            .single()
            .throwOnError();

          if (teamError) throw teamError;

          await get().fetchTeams();
          
          toast.success('Team updated successfully');
          return team as TeamWithRole;
        } catch (error) {
          set({ error: 'Failed to update team' });
          toast.error('Failed to update team');
          return null;
        } finally {
          set({ isUpdating: false });
        }
      },

      deleteTeam: async (teamId) => {
        try {
          set({ isUpdating: true, error: null });

          const { error } = await supabase
            .from('teams')
            .delete()
            .eq('id', teamId)
            .throwOnError();

          if (error) throw error;

          set(state => ({
            teams: state.teams.filter(t => t.id !== teamId),
            currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam,
          }));

          toast.success('Team deleted successfully');
          return true;
        } catch (error) {
          set({ error: 'Failed to delete team' });
          toast.error('Failed to delete team');
          return false;
        } finally {
          set({ isUpdating: false });
        }
      },

      setCurrentTeam: (teamId) => {
        if (!teamId) {
          set({ currentTeam: null });
          return;
        }

        const team = get().teams.find(t => t.id === teamId);
        if (team) {
          set({ currentTeam: team });
        }
      },

      fetchTeamMembers: async (teamId) => {
        try {
          set({ isFetching: true, error: null });

          const { data: members, error: membersError } = await supabase
            .from('team_members')
            .select(`
              team_id,
              user_id,
              role,
              created_at,
              updated_at,
              profiles:user_id (
                full_name,
                email,
                avatar_url
              )
            `)
            .returns<TeamMemberResponse[]>()
            .eq('team_id', teamId)
            .throwOnError();

          if (membersError) throw membersError;

          const teamMembers: TeamMember[] = members.map(m => ({
            team_id: m.team_id,
            user_id: m.user_id,
            role: m.role,
            created_at: m.created_at,
            updated_at: m.updated_at,
            profile: m.profiles
          }));

          set({ members: teamMembers });
        } catch (error) {
          set({ error: 'Failed to fetch team members' });
          toast.error('Failed to fetch team members');
        } finally {
          set({ isFetching: false });
        }
      },

      addTeamMember: async (teamId, payload) => {
        try {
          set({ isCreating: true, error: null });

          // First check if user exists and has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select()
            .eq('id', payload.userId)
            .single();

          if (profileError || !profile) {
            throw new Error('User not found');
          }

          // Check if user is already a member
          const { data: existing, error: existingError } = await supabase
            .from('team_members')
            .select()
            .eq('team_id', teamId)
            .eq('user_id', payload.userId)
            .maybeSingle();

          if (existing) {
            throw new Error('User is already a member of this team');
          }

          const { error: memberError } = await supabase
            .from('team_members')
            .insert({
              team_id: teamId,
              user_id: payload.userId,
              role: payload.role,
            })
            .throwOnError();

          if (memberError) throw memberError;

          await get().fetchTeamMembers(teamId);
          
          toast.success('Team member added successfully');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add team member';
          set({ error: message });
          toast.error(message);
          return false;
        } finally {
          set({ isCreating: false });
        }
      },

      updateTeamMember: async (teamId, userId, payload) => {
        try {
          set({ isUpdating: true, error: null });

          // Check if this would remove the last admin
          if (payload.role !== 'ADMIN') {
            const { data: admins, error: adminsError } = await supabase
              .from('team_members')
              .select('user_id')
              .eq('team_id', teamId)
              .eq('role', 'ADMIN');

            if (adminsError) throw adminsError;

            if (admins.length === 1 && admins[0].user_id === userId) {
              throw new Error('Cannot remove the last admin');
            }
          }

          const { error: memberError } = await supabase
            .from('team_members')
            .update({
              role: payload.role,
              updated_at: new Date().toISOString(),
            })
            .eq('team_id', teamId)
            .eq('user_id', userId)
            .throwOnError();

          if (memberError) throw memberError;

          await get().fetchTeamMembers(teamId);
          
          toast.success('Team member updated successfully');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update team member';
          set({ error: message });
          toast.error(message);
          return false;
        } finally {
          set({ isUpdating: false });
        }
      },

      removeTeamMember: async (teamId, userId) => {
        try {
          set({ isUpdating: true, error: null });

          // Check if this would remove the last admin
          const { data: member, error: memberError } = await supabase
            .from('team_members')
            .select('role')
            .eq('team_id', teamId)
            .eq('user_id', userId)
            .single();

          if (memberError) throw memberError;

          if (member.role === 'ADMIN') {
            const { data: admins, error: adminsError } = await supabase
              .from('team_members')
              .select('user_id')
              .eq('team_id', teamId)
              .eq('role', 'ADMIN');

            if (adminsError) throw adminsError;

            if (admins.length === 1) {
              throw new Error('Cannot remove the last admin');
            }
          }

          const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('team_id', teamId)
            .eq('user_id', userId)
            .throwOnError();

          if (error) throw error;

          await get().fetchTeamMembers(teamId);
          
          toast.success('Team member removed successfully');
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to remove team member';
          set({ error: message });
          toast.error(message);
          return false;
        } finally {
          set({ isUpdating: false });
        }
      },
    }),
    {
      name: 'team-store',
      partialize: (state) => ({
        teams: state.teams,
        currentTeam: state.currentTeam,
      }),
    }
  )
); 