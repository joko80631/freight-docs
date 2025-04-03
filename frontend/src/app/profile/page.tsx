'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/teamStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { teams = [], getCurrentRole = () => undefined } = useTeamStore();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const role = getCurrentRole?.() || undefined;
          setProfile({
            id: user?.id || '',
            email: user?.email || '',
            name: user?.user_metadata?.name,
            role
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase, getCurrentRole]);

  if (loading) {
    return <LoadingSkeleton className="h-[400px]" />;
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>No profile found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Name</h3>
            <p className="text-sm text-muted-foreground">
              {profile?.name || 'Not set'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Email</h3>
            <p className="text-sm text-muted-foreground">{profile?.email || ''}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Role</h3>
            <p className="text-sm text-muted-foreground">
              {profile?.role || 'No role assigned'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage; 