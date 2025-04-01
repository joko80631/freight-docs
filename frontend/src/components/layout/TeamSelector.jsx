'use client';

import { useState } from 'react';
import { useTeam } from '@/hooks/useTeam';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Users, Settings, Circle } from 'lucide-react';
import Link from 'next/link';

export default function TeamSelector() {
  const { currentTeam, teams, switchTeam, isAdmin } = useTeam();
  const [open, setOpen] = useState(false);

  if (!currentTeam) {
    return (
      <Link href="/teams/new" className="text-sm font-medium text-blue-600 hover:text-blue-800">
        Create Team
      </Link>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="text-sm text-gray-500">No teams available</div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
          <Users className="h-4 w-4" />
          <span>{currentTeam.name}</span>
          <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => {
              switchTeam(team.id);
              setOpen(false);
            }}
            className={`flex items-center ${
              currentTeam.id === team.id ? 'bg-blue-50' : ''
            }`}
          >
            <Users className="mr-2 h-4 w-4" />
            <span className="flex-1">{team.name}</span>
            {currentTeam.id === team.id && (
              <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
            )}
          </DropdownMenuItem>
        ))}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/teams" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Manage Teams</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 