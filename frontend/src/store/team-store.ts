import { createBrowserClient } from '@supabase/ssr'
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Team {
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

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'member';
}

interface Profile {
  email: string;
  full_name: string;
}

interface TeamMemberWithProfile {
  id: string;
  role: 'owner' | 'admin' | 'member';
  profiles: Profile;
}

interface TeamStore {
  teams: Team[];
  currentTeam: Team | null;
  hasAttemptedLoad: boolean;
  isLoading: boolean;
  error: Error | null;
  setCurrentTeam: (team: Team | null) => void;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  reset: () => void;
  fetchTeamMembers: (teamId: string) => Promise<TeamMember[]>;
  updateTeamMemberRole: (teamId: string, memberId: string, role: 'owner' | 'admin' | 'member') => Promise<void>;
  removeTeamMember: (teamId: string, memberId: string) => Promise<void>;
}

const createSupabaseClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      teams: [],
      currentTeam: null,
      hasAttemptedLoad: false,
      isLoading: false,
      error: null,

      setCurrentTeam: (team: Team | null) => {
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
          const supabase = createSupabaseClient();
          
          // Check authentication first
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) throw authError;
          if (!user) {
            set({ 
              teams: [], 
              currentTeam: null, 
              hasAttemptedLoad: true,
              isLoading: false 
            });
            return;
          }

          const { data: teams, error } = await supabase
            .from('teams')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          set({ 
            teams: teams || [], 
            currentTeam: teams?.[0] || null,
            hasAttemptedLoad: true,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching teams:', error);
          set({ 
            error: error instanceof Error ? error : new Error('Failed to fetch teams'),
            teams: [],
            currentTeam: null,
            isLoading: false 
          });
        }
      },

      createTeam: async (name) => {
        try {
          const supabase = createSupabaseClient();
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
          const supabase = createSupabaseClient();
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
          const supabase = createSupabaseClient();
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
      },

      fetchTeamMembers: async (teamId: string) => {
        const supabase = createSupabaseClient();
        const { data: rawData, error } = await supabase
          .from('team_members')
          .select(`
            id,
            role,
            profiles:user_id (
              email,
              full_name
            )
          `)
          .eq('team_id', teamId);

        if (error) throw error;

        // Ensure the data matches our expected type
        const data = rawData as unknown as TeamMemberWithProfile[];

        return data.map(member => ({
          id: member.id,
          email: member.profiles.email,
          full_name: member.profiles.full_name,
          role: member.role,
        }));
      },

      updateTeamMemberRole: async (teamId: string, memberId: string, role: 'owner' | 'admin' | 'member') => {
        const supabase = createSupabaseClient();
        const { error } = await supabase
          .from('team_members')
          .update({ role })
          .eq('id', memberId)
          .eq('team_id', teamId);

        if (error) throw error;
      },

      removeTeamMember: async (teamId: string, memberId: string) => {
        const supabase = createSupabaseClient();
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', memberId)
          .eq('team_id', teamId);

        if (error) throw error;
      },
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