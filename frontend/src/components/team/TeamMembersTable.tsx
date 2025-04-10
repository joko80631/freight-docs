import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, UserPlus } from 'lucide-react';
import { TeamMember, TeamRole } from '@/types/team';
import { useTeamStore } from '@/store/teamStore';
import { AddTeamMemberDialog } from './AddTeamMemberDialog';
import { formatDistanceToNow } from 'date-fns';

interface TeamMembersTableProps {
  teamId: string;
  currentUserRole: TeamRole;
}

export function TeamMembersTable({ teamId, currentUserRole }: TeamMembersTableProps) {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const { members, isFetching, updateTeamMember, removeTeamMember } = useTeamStore();

  const handleRoleChange = async (userId: string, newRole: TeamRole) => {
    await updateTeamMember(teamId, userId, { role: newRole });
  };

  const handleRemoveMember = async (userId: string) => {
    await removeTeamMember(teamId, userId);
  };

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Team Members</h2>
        {isAdmin && (
          <Button
            onClick={() => setIsAddMemberOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.user_id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.profile?.avatar_url} />
                    <AvatarFallback>
                      {member.profile?.full_name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.profile?.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.profile?.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.role === 'admin' ? 'default' : 'secondary'}
                  >
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.created_at && formatDistanceToNow(new Date(member.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role !== 'admin' && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.user_id, 'admin')}
                          >
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        {member.role === 'admin' && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.user_id, 'member')}
                          >
                            Remove Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {members.length === 0 && !isFetching && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 4 : 3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No team members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddTeamMemberDialog
        teamId={teamId}
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
      />
    </div>
  );
} 