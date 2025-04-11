import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTeamStore } from '@/store/team-store';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function TeamSelectionModal() {
  const router = useRouter();
  const { currentTeam, teams, fetchTeams, createTeam, setCurrentTeam } = useTeamStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadTeams = async () => {
      await fetchTeams();
      setIsLoading(false);
    };
    loadTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const team = await createTeam({
        name: newTeamName.trim(),
        created_by: user.id,
      });

      setCurrentTeam(team);
      toast.success('Team created successfully');
    } catch (error) {
      toast.error('Failed to create team');
      console.error('Create team error:', error);
    } finally {
      setIsCreating(false);
      setNewTeamName('');
    }
  };

  const handleSelectTeam = (team: typeof teams[0]) => {
    setCurrentTeam(team);
    toast.success(`Switched to ${team.name}`);
  };

  if (isLoading) {
    return (
      <Dialog open={true}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={!currentTeam}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select or Create a Team</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {teams.length > 0 && (
            <div className="space-y-2">
              <Label>Select an existing team</Label>
              <div className="grid gap-2">
                {teams.map((team) => (
                  <Button
                    key={team.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSelectTeam(team)}
                  >
                    {team.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Create a new team</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                disabled={isCreating}
              />
              <Button onClick={handleCreateTeam} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 