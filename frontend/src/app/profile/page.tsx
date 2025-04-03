'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTeamStore } from '@/store/teamStore';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { teams, role } = useTeamStore();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
        return;
      }

      setProfile({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name,
        created_at: user.created_at,
      });
      setLoading(false);
    }

    loadProfile();
  }, [router, supabase.auth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>
                {profile.full_name?.[0] || profile.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{profile.full_name || 'No name set'}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium">Role</h4>
              <p className="text-sm text-muted-foreground">{role || 'No role assigned'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Teams</h4>
              {teams && teams.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {teams.map((team) => (
                    <li key={team.id} className="text-sm text-muted-foreground">
                      {team.name} ({team.role})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Not a member of any teams</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 