'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/store/team-store';
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
import { Plus, Settings, Users } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

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
  updated_at: string;
  created_by: string;
  role: 'admin' | 'member' | 'viewer';
  member_count?: number;
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
  const { 
    teams = [], 
    currentTeam = null,
    isLoading = false,
    fetchTeams = async () => {},
    setCurrentTeam = async () => {},
    createTeam = async () => {},
    updateTeam = async () => {},
    deleteTeam = async () => {}
  } = useTeamStore();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser({ id: user.id });
        }

        await fetchTeams();
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
  }, [supabase, currentTeam, fetchTeams]);

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
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
      setIsRemoveDialogOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }

  async function handleInviteMember() {
    try {
      // For MVP, we'll just show a success message
      // In production, this would create an invite record and send an email
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      setIsInviteDialogOpen(false);
      setInviteEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }

  const handleCreateTeam = () => {
    router?.push('/teams/new');
  };

  const handleSwitchTeam = async (team: Team) => {
    if (!team) return;
    try {
      const teamWithRole: Team = {
        ...team,
        role: 'admin', // Default role for team creator
        updated_at: team.updated_at || new Date().toISOString(),
        created_by: team.created_by || currentUser?.id || ''
      };
      await setCurrentTeam(teamWithRole);
      setTeam(teamWithRole);
      await loadTeamMembers(team.id);
      toast({
        title: "Success",
        description: `Switched to ${team?.name || 'team'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
        <EmptyState
          icon={Users}
          title="No teams found"
          description="You haven't joined or created any teams yet."
          cta={{
            label: 'Create Team',
            onClick: handleCreateTeam
          }}
          secondaryCta={null}
          className=""
          aria-label="No teams found"
          variant="centered"
        />
      </div>
    );
  }

  const isAdmin = members.find(m => m.user_id === currentUser?.id)?.role === 'admin';
  const adminCount = members.filter(m => m.role === 'admin').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-sm text-gray-500">
            Manage your teams and team members
          </p>
        </div>
        <Button onClick={handleCreateTeam}>
          <Plus className="mr-2 h-4 w-4" />
          New Team
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(teams || []).map((t) => t && (
          <Card 
            key={t?.id}
            className={currentTeam?.id === t?.id ? 'border-primary' : ''}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {t?.name}
                {currentTeam?.id === t?.id && (
                  <span className="text-sm text-primary">Current Team</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  {t?.member_count || 0} members
                </p>
                <div className="flex gap-2 mt-2">
                  {currentTeam?.id !== t?.id && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSwitchTeam(t)}
                    >
                      Switch to Team
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSwitchTeam(t)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {team && (
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
      )}

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