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
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useTeamStore } from '@/store/team-store';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'member';
}

interface TeamMemberListProps {
  teamId: string;
  members: TeamMember[];
  currentUserRole: 'owner' | 'admin' | 'member';
  onMemberUpdate: () => void;
}

export function TeamMemberList({ teamId, members, currentUserRole, onMemberUpdate }: TeamMemberListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateTeamMemberRole, removeTeamMember } = useTeamStore();
  const { toast } = useToast();

  const handleRoleUpdate = async (memberId: string, newRole: 'owner' | 'admin' | 'member') => {
    setIsLoading(true);
    try {
      await updateTeamMemberRole(teamId, memberId, newRole);
      onMemberUpdate();
      toast({
        title: 'Success',
        description: 'Member role updated successfully',
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsLoading(true);
    try {
      await removeTeamMember(teamId, memberId);
      onMemberUpdate();
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            {canManageMembers && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.full_name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell className="capitalize">{member.role}</TableCell>
              {canManageMembers && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role !== 'owner' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleRoleUpdate(member.id, 'admin')}
                            disabled={isLoading}
                          >
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleUpdate(member.id, 'member')}
                            disabled={isLoading}
                          >
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isLoading}
                            className="text-red-600"
                          >
                            Remove
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 