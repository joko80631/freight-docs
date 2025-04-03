import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database, Team, TeamMember, UserRole } from '@/types/database';
import { getErrorMessage } from '@/lib/errors';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface TeamWithRole extends Team {
  role: UserRole;
}

interface TeamStore {
  user: User | null;
  teams: TeamWithRole[];
  currentTeam: TeamWithRole | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  fetchTeams: () => Promise<void>;
  setCurrentTeam: (team: TeamWithRole | null) => void;
  createTeam: (name: string) => Promise<TeamWithRole>;
  // Computed selectors
  isAdmin: () => boolean;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  user: null,
  teams: [],
  currentTeam: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
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
        .returns<(TeamMember & { teams: Team })[]>();

      if (error) throw error;

      const transformedTeams = data
        ?.filter(Boolean)
        ?.filter(team => team.teams)
        ?.map(team => ({
          ...team.teams,
          role: team.role
        })) ?? [];

      set({ teams: transformedTeams });

      // Set current team if not already set
      const { currentTeam } = get();
      if (!currentTeam && transformedTeams.length > 0) {
        set({ currentTeam: transformedTeams[0] });
      }
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentTeam: (team) => set({ currentTeam: team }),

  createTeam: async (name: string) => {
    const supabase = createClientComponentClient<Database>();
    
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{ name }])
      .select()
      .single<Team>();

    if (teamError || !team) {
      throw new Error(getErrorMessage(teamError));
    }

    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        role: 'ADMIN' as const
      }]);

    if (memberError) {
      throw new Error(getErrorMessage(memberError));
    }

    // Create the TeamWithRole object
    const teamWithRole: TeamWithRole = {
      ...team,
      role: 'ADMIN'
    };

    // Refresh teams list
    await get().fetchTeams();

    return teamWithRole;
  },

  isAdmin: () => {
    const { currentTeam } = get();
    return currentTeam?.role === 'ADMIN';
  }
})); 