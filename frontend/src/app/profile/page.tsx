'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useTeamStore from '@/store/teamStore';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { teams, role } = useTeamStore();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        setProfile({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          created_at: user.created_at,
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : profile.email[0].toUpperCase();

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {profile.full_name || 'User Profile'}
          </h1>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Member Since
              </p>
              <p>
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Account ID
              </p>
              <p className="font-mono text-sm">{profile.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <p className="text-muted-foreground">No team memberships</p>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Role: {team.role}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined{' '}
                      {new Date(team.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 