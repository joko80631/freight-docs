"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useToastNotification } from "@/components/shared";
import { LoadingSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Simple hash function to generate consistent colors
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// TODO: Consider storing team colors in the database to avoid potential hash collisions
// when many teams have similar names. For MVP, this hash-based approach is sufficient,
// but we should monitor for any color conflicts in production.
function getTeamColor(teamName) {
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export function TeamContext({ teams, currentTeam, onTeamSwitch }) {
  const router = useRouter();
  const { showSuccess } = useToastNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleTeamSwitch = async (teamId) => {
    if (teamId === currentTeam?.id) return;
    
    setIsLoading(true);
    try {
      await onTeamSwitch(teamId);
      showSuccess("Team switched", `Now viewing ${teams.find(t => t.id === teamId)?.name}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to switch team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentTeam) {
    return (
      <Button variant="outline" size="sm" disabled>
        <LoadingSkeleton variant="text" className="w-24" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            getTeamColor(currentTeam.name)
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSkeleton variant="text" className="w-24" />
          ) : (
            <>
              {currentTeam.name}
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => handleTeamSwitch(team.id)}
            className={cn(
              "cursor-pointer",
              team.id === currentTeam.id && "bg-muted"
            )}
          >
            <div className={cn("mr-2 h-2 w-2 rounded-full", getTeamColor(team.name))} />
            {team.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/teams/new")}
          className="cursor-pointer"
        >
          Create New Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 