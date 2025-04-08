'use client';

import { TeamMembers } from '@/components/team/TeamMembers';
import { RequireTeam } from '@/components/RequireTeam';

export default function TeamPage() {
  return (
    <RequireTeam>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles.
          </p>
        </div>
        <TeamMembers />
      </div>
    </RequireTeam>
  );
} 