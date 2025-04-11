'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useTeamStore } from '@/store/team-store';
import { roleColors } from '@/lib/theme';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/types/permissions';
import { RequirePermission } from '@/components/RequirePermission';
import { UnauthorizedAccess } from '@/components/UnauthorizedAccess';

type TeamRole = 'owner' | 'admin' | 'member';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: TeamRole;
}

const ROLE_CONFIG: Record<TeamRole, { label: string; className: string }> = {
  owner: {
    label: 'Owner',
    className: roleColors.admin.bg,
  },
  admin: {
    label: 'Admin',
    className: roleColors.admin.bg,
  },
  member: {
    label: 'Member',
    className: roleColors.user.bg,
  },
};

interface TeamMemberBadgeProps {
  role: TeamRole;
}

function TeamMemberBadge({ role }: TeamMemberBadgeProps) {
  const config = ROLE_CONFIG[role];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

export function TeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamRole>('member');
  const { currentTeam, fetchTeamMembers, updateTeamMemberRole, removeTeamMember } = useTeamStore();
  const { canInviteMembers, canManageMembers } = usePermissions();

  useEffect(() => {
    if (currentTeam) {
      loadMembers();
    }
  }, [currentTeam]);

  const loadMembers = async () => {
    if (!currentTeam) return;
    setIsLoading(true);
    try {
      const members = await fetchTeamMembers(currentTeam.id);
      setMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !canInviteMembers()) return;

    setIsInviting(true);
    try {
      const response = await fetch(`/api/teams/${currentTeam.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to invite member');
      }

      toast.success('Member invited successfully');
      setEmail('');
      loadMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to invite member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: TeamRole) => {
    if (!currentTeam || !canManageMembers()) return;

    try {
      await updateTeamMemberRole(currentTeam.id, memberId, role);
      toast.success('Member role updated successfully');
      loadMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam || !canManageMembers()) return;

    setIsRemoving(true);
    try {
      await removeTeamMember(currentTeam.id, memberId);
      toast.success('Member removed successfully');
      loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      <RequirePermission 
        permission={PERMISSIONS.INVITE_TEAM_MEMBER}
        fallback={<UnauthorizedAccess message="You don't have permission to invite team members." />}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: TeamRole) => setSelectedRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? 'Inviting...' : 'Invite Member'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </RequirePermission>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.full_name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <RequirePermission 
                  permission={PERMISSIONS.UPDATE_TEAM_MEMBER}
                  fallback={<TeamMemberBadge role={member.role} />}
                >
                  <Select
                    value={member.role}
                    onValueChange={(value: TeamRole) => handleUpdateRole(member.id, value)}
                    disabled={!canManageMembers()}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue>
                        <TeamMemberBadge role={member.role} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </RequirePermission>
              </TableCell>
              <TableCell className="text-right">
                <RequirePermission 
                  permission={PERMISSIONS.DELETE_TEAM_MEMBER}
                  fallback={null}
                >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={!canManageMembers()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this team member? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMember(member.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isRemoving}
                        >
                          {isRemoving ? 'Removing...' : 'Remove Member'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </RequirePermission>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 