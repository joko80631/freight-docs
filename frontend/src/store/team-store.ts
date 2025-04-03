import { create } from "zustand";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  role: 'admin' | 'member' | 'viewer';
  member_count?: number;
}

interface TeamStore {
  currentTeam: Team | null;
  teams: Team[];
  isLoading: boolean;
  setCurrentTeam: (team: Team | null) => void;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  currentTeam: null,
  teams: [],
  isLoading: false,
  setCurrentTeam: (team) => set({ currentTeam: team }),
  fetchTeams: async () => {
    set({ isLoading: true });
    try {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .eq('created_by', user.id);

      if (error) throw error;
      set({ teams: teams || [] });
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  createTeam: async (name) => {
    try {
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { data: team, error } = await supabase
        .from('teams')
        .insert([{ name, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        teams: [...state.teams, team],
        currentTeam: team
      }));
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
        teams: state.teams.map((t) => t.id === teamId ? team : t),
        currentTeam: state.currentTeam?.id === teamId ? team : state.currentTeam
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
  }
})); 