import { create } from 'zustand';

interface Team {
  id: string;
  name: string;
  created_at: string;
}

interface TeamStore {
  currentTeam: Team | null;
  setCurrentTeam: (team: Team | null) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  currentTeam: null,
  setCurrentTeam: (team) => set({ currentTeam: team }),
})); 