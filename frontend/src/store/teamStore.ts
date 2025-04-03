import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface Team {
  id: string;
  name: string;
  role: string;
}

interface TeamStore {
  user: User | null;
  teams: Team[];
  currentTeam: Team | null;
  setUser: (user: User | null) => void;
  setTeams: (teams: Team[]) => void;
  setCurrentTeam: (team: Team | null) => void;
  // Computed selectors
  isAdmin: () => boolean;
  getCurrentRole: () => string | null;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  user: null,
  teams: [],
  currentTeam: null,
  setUser: (user) => set({ user }),
  setTeams: (teams) => set({ teams }),
  setCurrentTeam: (team) => set({ currentTeam: team }),
  // Computed selectors
  isAdmin: () => {
    const { currentTeam } = get();
    return currentTeam?.role === 'admin' || false;
  },
  getCurrentRole: () => {
    const { currentTeam } = get();
    return currentTeam?.role ?? null;
  }
})); 