'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/alert-dialog';
import { useTeamStore, Team } from '@/store/team-store';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/types/permissions';
import { RequirePermission } from '@/components/RequirePermission';
import { UnauthorizedAccess } from '@/components/UnauthorizedAccess';

export function TeamSettings() {
  const [teamName, setTeamName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentTeam, fetchTeams } = useTeamStore();
  const { canManageTeam, canDeleteTeam } = usePermissions();
  const supabase = createClientComponentClient();
  const router = useRouter();

  if (!currentTeam) return null;

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !canManageTeam()) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('teams')
        .update({ name: teamName })
        .eq('id', currentTeam.id);

      if (error) throw error;

      toast.success('Team updated successfully');
      fetchTeams();
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!canDeleteTeam()) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', currentTeam.id);

      if (error) throw error;

      toast.success('Team deleted successfully');
      await fetchTeams();
      router.push('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <RequirePermission 
        permission={PERMISSIONS.UPDATE_TEAM}
        fallback={<UnauthorizedAccess message="You don't have permission to manage team settings." />}
      >
        <Card>
          <CardHeader>
            <CardTitle>Team Settings</CardTitle>
            <CardDescription>
              Manage your team's basic information and settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={currentTeam.name}
                />
              </div>
              <Button type="submit" disabled={isUpdating || !canManageTeam()}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Team
              </Button>
            </form>
          </CardContent>
        </Card>
      </RequirePermission>

      <RequirePermission 
        permission={PERMISSIONS.DELETE_TEAM}
        fallback={<UnauthorizedAccess message="You don't have permission to delete this team." />}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Delete Team</h3>
              <p className="text-sm text-muted-foreground">
                Once you delete a team, there is no going back. Please be certain.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="mt-4"
                  disabled={!canDeleteTeam()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Team
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the team
                    and remove all team members.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteTeam}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting || !canDeleteTeam()}
                  >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Team
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </RequirePermission>
    </div>
  );
} 