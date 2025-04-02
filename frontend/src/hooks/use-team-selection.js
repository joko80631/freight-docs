import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToastNotification } from "@/components/shared";

const TEAM_STORAGE_KEY = "freightdocs_current_team";

export function useTeamSelection(teams, currentTeam, onTeamSwitch) {
  const router = useRouter();
  const { showError } = useToastNotification();

  // Auto-select team on mount if needed
  useEffect(() => {
    if (!teams?.length) return;

    const storedTeamId = localStorage.getItem(TEAM_STORAGE_KEY);
    
    // If we have a stored team and it exists in our teams list
    if (storedTeamId && teams.some(t => t.id === storedTeamId)) {
      if (storedTeamId !== currentTeam?.id) {
        onTeamSwitch(storedTeamId);
      }
      return;
    }

    // If we have teams but no current selection
    if (!currentTeam && teams.length > 0) {
      // Try to find the most recently used team
      const mostRecentTeam = teams.reduce((latest, team) => {
        if (!latest) return team;
        return team.lastAccessed > latest.lastAccessed ? team : latest;
      }, null);

      if (mostRecentTeam) {
        onTeamSwitch(mostRecentTeam.id);
        localStorage.setItem(TEAM_STORAGE_KEY, mostRecentTeam.id);
      }
    }
  }, [teams, currentTeam, onTeamSwitch]);

  // Handle team switching
  const handleTeamSwitch = async (teamId) => {
    try {
      await onTeamSwitch(teamId);
      localStorage.setItem(TEAM_STORAGE_KEY, teamId);
    } catch (error) {
      showError(
        "Failed to switch team",
        "There was an error switching teams. Please try again."
      );
      console.error("Team switch error:", error);
    }
  };

  // Handle team deletion/removal
  useEffect(() => {
    if (!currentTeam || !teams?.length) return;

    // If current team no longer exists in teams list
    if (!teams.some(t => t.id === currentTeam.id)) {
      localStorage.removeItem(TEAM_STORAGE_KEY);
      
      // If we have other teams, switch to the first one
      if (teams.length > 0) {
        handleTeamSwitch(teams[0].id);
      } else {
        // No teams left, redirect to team creation
        router.push("/teams/new");
      }
    }
  }, [teams, currentTeam, router]);

  return {
    handleTeamSwitch,
  };
} 