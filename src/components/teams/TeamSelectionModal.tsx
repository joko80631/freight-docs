'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTeamStore } from '@/store/team-store';

export function TeamSelectionModal() {
  const { teams, currentTeam, setCurrentTeam } = useTeamStore();

  return (
    <Dialog open={!currentTeam}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a Team</DialogTitle>
          <DialogDescription>
            Please select a team to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {teams?.map((team) => (
            <button
              key={team.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              onClick={() => setCurrentTeam(team)}
            >
              <span className="font-medium">{team.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 