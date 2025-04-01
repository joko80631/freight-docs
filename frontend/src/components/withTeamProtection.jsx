'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useTeamStore from '../store/teamStore';
import { RequireTeam } from './RequireTeam';

export function withTeamProtection(Component) {
  return function ProtectedComponent(props) {
    const router = useRouter();
    const { teams, error } = useTeamStore();

    // If there's an error, show it with a retry button
    if (error) {
      return (
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold text-red-600">Failed to Load Teams</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-primary hover:underline"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <RequireTeam>
        <Component {...props} />
      </RequireTeam>
    );
  };
} 