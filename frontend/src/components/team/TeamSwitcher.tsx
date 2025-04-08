"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTeamStore } from '@/store/teamStore';
import { CreateTeamDialog } from './CreateTeamDialog';

export function TeamSwitcher() {
  const [open, setOpen] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const router = useRouter();
  const { teams, currentTeam, setCurrentTeam } = useTeamStore();

  const handleSelectTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(teamId);
      router.push(`/teams/${teamId}`);
      setOpen(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className="w-[200px] justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-medium">
                {currentTeam?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="truncate">{currentTeam?.name || 'Select team'}</span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search team..." />
            <CommandList>
              <CommandEmpty>No team found.</CommandEmpty>
              <CommandGroup heading="Teams">
                {teams.map((team) => (
                  <CommandItem
                    key={team.id}
                    onSelect={() => handleSelectTeam(team.id)}
                    className="text-sm"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-md border bg-muted text-xs font-medium">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2">{team.name}</span>
                    {currentTeam?.id === team.id && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowCreateTeam(true);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Team
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateTeamDialog
        open={showCreateTeam}
        onOpenChange={setShowCreateTeam}
      />
    </>
  );
} 