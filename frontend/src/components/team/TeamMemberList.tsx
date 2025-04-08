'use client';

import { useState } from 'react';
import { MoreVertical, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeamStore } from '@/store/teamStore';
import { TeamMember } from '@/types/team';
import { AddTeamMemberDialog } from './AddTeamMemberDialog';

interface TeamMemberListProps {
  teamId: string;
}

export function TeamMemberList({ teamId }: TeamMemberListProps) {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const { teams, currentTeam } = useTeamStore();
  const team = teams.find(t => t.id === teamId);

  if (!team) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Team Members</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddMemberOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="space-y-2">
        {team.members?.map((member: TeamMember) => (
          <div
            key={member.user_id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {member.profile?.full_name || 'Unknown User'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {member.profile?.email || 'No email provided'}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    // TODO: Implement role change
                  }}
                >
                  Change Role
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    // TODO: Implement remove member
                  }}
                >
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <AddTeamMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        teamId={teamId}
      />
    </div>
  );
} 