'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/store/teamStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getErrorMessage } from '@/lib/errors';
import { format } from 'date-fns';

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'admin' | 'member' | 'viewer';
  email: string;
  name?: string;
  joined_at: string;
}

interface Team {
  id: string;
  name: string;
  created_at: string;
}

function TeamsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const { currentTeam } = useTeamStore();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser({ id: user.id });
        }

        if (currentTeam) {
          setTeam(currentTeam);
          await loadTeamMembers(currentTeam.id);
        }
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase, currentTeam]);

  async function loadTeamMembers(teamId: string) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  async function handleRoleChange(memberId: string, newRole: 'admin' | 'member' | 'viewer') {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      setMembers(members.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      setSuccess('Role updated successfully');
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  async function handleRemoveMember() {
    if (!memberToRemove) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberToRemove.id);

      if (error) throw error;

      setMembers(members.filter(member => member.id !== memberToRemove.id));
      setSuccess('Member removed successfully');
      setIsRemoveDialogOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  async function handleInviteMember() {
    try {
      // For MVP, we'll just show a success message
      // In production, this would create an invite record and send an email
      setSuccess('Invitation sent successfully');
      setIsInviteDialogOpen(false);
      setInviteEmail('');
    } catch (error) {
      setError(getErrorMessage(error));
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const isAdmin = members.find(m => m.user_id === currentUser?.id)?.role === 'admin';
  const adminCount = members.filter(m => m.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">
          Manage your team members and their roles
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          {isAdmin && (
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>Invite Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: 'admin' | 'member' | 'viewer') => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteMember}>
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.name || member.email}
                    {member.user_id === currentUser?.id && (
                      <Badge variant="secondary" className="ml-2">(You)</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isAdmin && member.user_id !== currentUser?.id ? (
                      <Select
                        value={member.role}
                        onValueChange={(value: 'admin' | 'member' | 'viewer') => 
                          handleRoleChange(member.id, value)
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">{member.role}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(member.joined_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {isAdmin && member.user_id !== currentUser?.id && (
                      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setMemberToRemove(member)}
                          >
                            Remove
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remove Team Member</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove {member.name || member.email} from the team?
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleRemoveMember}
                              disabled={adminCount <= 1 && member.role === 'admin'}
                            >
                              Remove Member
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {team && (
        <Card>
          <CardHeader>
            <CardTitle>Team Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Team Name</Label>
                <Input
                  value={team.name}
                  disabled={!isAdmin}
                  onChange={(e) => setTeam({ ...team, name: e.target.value })}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Created on {format(new Date(team.created_at), 'MMMM d, yyyy')}
              </div>
              <div className="text-sm text-muted-foreground">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TeamsPage; 