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
import { useTeamStore } from '@/store/teamStore';
import { TeamRole, TeamMember } from '@/types/team';
import { createTeamScopedApi } from '@/utils/api';
import { roleColors } from '@/lib/theme';
import { toast } from 'sonner';

const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    ...roleColors.admin,
  },
  admin: {
    label: 'Admin',
    ...roleColors.admin,
  },
  member: {
    label: 'Member',
    ...roleColors.user,
  },
} as const;

interface TeamMemberBadgeProps {
  role: TeamRole;
}

export const TeamMemberBadge: React.FC<TeamMemberBadgeProps> = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.member;

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${config.bg} ${config.text} ${config.border}`}>
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

export function TeamMembers() {
  const { currentTeam } = useTeamStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = createTeamScopedApi();

  useEffect(() => {
    if (currentTeam?.id) {
      fetchMembers();
    }
  }, [currentTeam?.id]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/');
      if (data?.members) {
        setMembers(data.members);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setError('Failed to load team members');
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }

      const data = await response.json();
      toast.success('Invitation sent', {
        description: `Invitation sent to ${data.email}`,
      });

      setInviteEmail('');
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
      toast.error('Failed to send invitation', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: TeamRole) => {
    try {
      const response = await api.patch(`/${userId}`, { role: newRole });
      if (response.success) {
        await fetchMembers();
        toast.success('Role updated successfully');
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const response = await api.delete(`/${userId}`);
      if (response.success) {
        await fetchMembers();
        toast.success('Team member removed successfully');
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove team member', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Team Members</h2>
        {currentTeam?.role === 'admin' && (
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: TeamRole) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                        <SelectItem key={role} value={role as TeamRole}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Send Invitation</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.user_id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{member.profile?.full_name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{member.profile?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <TeamMemberBadge role={member.role} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {currentTeam?.role === 'admin' && (
                      <>
                        <Select
                          value={member.role}
                          onValueChange={(value: TeamRole) => handleRoleChange(member.user_id, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                              <SelectItem key={role} value={role as TeamRole}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this member from the team? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveMember(member.user_id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 