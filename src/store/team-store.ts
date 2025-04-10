import { create } from 'zustand';

interface Team {
  id: string;
  name: string;
  // Add other team properties as needed
}

interface TeamStore {
  currentTeam: Team | null;
  isLoading: boolean;
  setCurrentTeam: (team: Team | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  currentTeam: null,
  isLoading: true,
  setCurrentTeam: (team) => set({ currentTeam: team }),
  setIsLoading: (loading) => set({ isLoading: loading }),
})); 