'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Toaster } from 'react-hot-toast';
import { useTeamStore } from '@/store/teamStore';

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { setCurrentTeam } = useTeamStore();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      // Fetch user's teams
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', session.user.id);

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        return;
      }

      // Set the first team as current if available
      if (teams?.length > 0) {
        setCurrentTeam(teams[0]);
      }
    };

    checkAuth();
  }, [router, supabase, setCurrentTeam]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      {children}
    </div>
  );
} 