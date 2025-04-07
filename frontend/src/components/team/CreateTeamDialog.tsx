import { useState } from 'react';
import { useTeamStore } from '@/store/team-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  role: 'owner' | 'admin' | 'member';
  member_count?: number;
}

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamCreated: (team: Team) => void;
}

export function CreateTeamDialog({ open, onOpenChange, onTeamCreated }: CreateTeamDialogProps) {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createTeam } = useTeamStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsLoading(true);
    try {
      const team = await createTeam(teamName);
      onTeamCreated(team);
      setTeamName('');
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to create team',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new team</DialogTitle>
          <DialogDescription>
            Add a new team to collaborate with others
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team name</Label>
            <Input
              id="name"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!teamName.trim() || isLoading}>
              {isLoading ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 