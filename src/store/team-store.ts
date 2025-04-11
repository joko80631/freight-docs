import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string | null;
  created_by: string;
  description?: string;
  members?: TeamMember[];
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'member';
  joined_at: string;
}

interface TeamStore {
  currentTeam: Team | null;
  teams: Team[];
  isLoading: boolean;
  hasAttemptedLoad: boolean;
  error: Error | null;
  setCurrentTeam: (team: Team | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  fetchTeams: () => Promise<void>;
  createTeam: (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => Promise<Team>;
  updateTeam: (id: string, team: Partial<Team>) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
  addTeamMember: (teamId: string, userId: string, role: TeamMember['role']) => Promise<TeamMember>;
  removeTeamMember: (teamId: string, userId: string) => Promise<void>;
  updateTeamMemberRole: (teamId: string, userId: string, role: TeamMember['role']) => Promise<TeamMember>;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  currentTeam: null,
  teams: [],
  isLoading: true,
  hasAttemptedLoad: false,
  error: null,
  setCurrentTeam: (team) => set({ currentTeam: team }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  fetchTeams: async () => {
    const supabase = createClientComponentClient();
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, members(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        teams: data ?? [], 
        isLoading: false, 
        hasAttemptedLoad: true,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch teams'),
        isLoading: false,
        hasAttemptedLoad: true
      });
    }
  },

  createTeam: async (team) => {
    const supabase = createClientComponentClient();
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([team])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        teams: [...state.teams, data],
        isLoading: false,
        error: null
      }));

      return data;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to create team'),
        isLoading: false
      });
      throw error;
    }
  },

  updateTeam: async (id, team) => {
    const supabase = createClientComponentClient();
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('teams')
        .update(team)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        teams: state.teams.map(t => t.id === id ? data : t),
        currentTeam: state.currentTeam?.id === id ? data : state.currentTeam,
        isLoading: false,
        error: null
      }));

      return data;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to update team'),
        isLoading: false
      });
      throw error;
    }
  },

  deleteTeam: async (id) => {
    const supabase = createClientComponentClient();
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        teams: state.teams.filter(t => t.id !== id),
        currentTeam: state.currentTeam?.id === id ? null : state.currentTeam,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to delete team'),
        isLoading: false
      });
      throw error;
    }
  },

  addTeamMember: async (teamId, userId, role) => {
    const supabase = createClientComponentClient();
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{ team_id: teamId, user_id: userId, role }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        teams: state.teams.map(team => 
          team.id === teamId 
            ? { ...team, members: [...(team.members || []), data] }
            : team
        ),
        isLoading: false,
        error: null
      }));

      return data;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to add team member'),
        isLoading: false
      });
      throw error;
    }
  },

  removeTeamMember: async (teamId, userId) => {
    const supabase = createClientComponentClient();
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .match({ team_id: teamId, user_id: userId });

      if (error) throw error;

      set(state => ({
        teams: state.teams.map(team => 
          team.id === teamId 
            ? { ...team, members: team.members?.filter(m => m.user_id !== userId) }
            : team
        ),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to remove team member'),
        isLoading: false
      });
      throw error;
    }
  },

  updateTeamMemberRole: async (teamId, userId, role) => {
    const supabase = createClientComponentClient();
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('team_members')
        .update({ role })
        .match({ team_id: teamId, user_id: userId })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        teams: state.teams.map(team => 
          team.id === teamId 
            ? { 
                ...team, 
                members: team.members?.map(m => 
                  m.user_id === userId ? data : m
                )
              }
            : team
        ),
        isLoading: false,
        error: null
      }));

      return data;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to update team member role'),
        isLoading: false
      });
      throw error;
    }
  },
})); 