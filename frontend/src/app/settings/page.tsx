'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/store/teamStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { getErrorMessage } from '@/lib/errors';
import { PageContainer } from '@/components/layout/page-container';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationPreferences {
  email_updates: boolean;
  document_alerts: boolean;
  team_changes: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  notification_preferences: NotificationPreferences;
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email_updates: true,
  document_alerts: true,
  team_changes: true
};

function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setProfile({
            id: user?.id || '',
            email: user?.email || '',
            name: user?.user_metadata?.name,
            notification_preferences: user?.user_metadata?.notification_preferences || DEFAULT_NOTIFICATION_PREFERENCES
          });
        }
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          name: profile?.name,
          notification_preferences: profile?.notification_preferences
        }
      });

      if (error) throw error;

      setSuccess('Profile updated successfully');
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.push('/');
    } catch (error) {
      setError(getErrorMessage(error));
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-4">
          <NotificationPreferences />
        </TabsContent>
        
        <TabsContent value="profile">
          <div>Profile settings coming soon...</div>
        </TabsContent>
        
        <TabsContent value="security">
          <div>Security settings coming soon...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage; 