import React, { useEffect, useState } from 'react';
import {
  NotificationPreferences as NotificationPreferencesType,
  NotificationCategory,
  NotificationType,
  NotificationFrequency,
} from '@/lib/email/types';
import {
  getUserNotificationPreferences,
  updateNotificationPreference,
  updateNotificationDigest,
} from '@/lib/email/services/notification-preferences';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  account: 'Account',
  documents: 'Documents',
  team: 'Team',
  loads: 'Loads',
  system: 'System',
  marketing: 'Marketing',
};

const TYPE_LABELS: Record<NotificationType, string> = {
  account_updates: 'Account Updates',
  password_changes: 'Password Changes',
  security_alerts: 'Security Alerts',
  document_uploads: 'Document Uploads',
  document_updates: 'Document Updates',
  document_deletions: 'Document Deletions',
  document_classifications: 'Document Classifications',
  missing_documents: 'Missing Documents',
  team_invites: 'Team Invites',
  team_role_changes: 'Team Role Changes',
  team_member_changes: 'Team Member Changes',
  load_created: 'Load Created',
  load_updated: 'Load Updated',
  load_status_changed: 'Load Status Changed',
  load_completed: 'Load Completed',
  system_maintenance: 'System Maintenance',
  system_updates: 'System Updates',
  marketing_newsletter: 'Newsletter',
  marketing_promotions: 'Promotions',
};

const FREQUENCY_LABELS: Record<NotificationFrequency, string> = {
  immediate: 'Immediate',
  daily: 'Daily Digest',
  weekly: 'Weekly Digest',
  never: 'Never',
};

export function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferencesType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  async function loadPreferences() {
    try {
      const prefs = await getUserNotificationPreferences(user!.id);
      setPreferences(prefs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handlePreferenceChange(
    category: NotificationCategory,
    type: NotificationType,
    enabled: boolean,
    frequency: NotificationFrequency
  ) {
    if (!user || !preferences) return;

    try {
      await updateNotificationPreference(user.id, category, type, enabled, frequency);
      
      setPreferences(prev => {
        if (!prev) return prev;
        const newPrefs = { ...prev };
        if (!newPrefs.categories[category].types[type]) {
          newPrefs.categories[category].types[type] = { enabled, frequency };
        } else {
          newPrefs.categories[category].types[type]!.enabled = enabled;
          newPrefs.categories[category].types[type]!.frequency = frequency;
        }
        return newPrefs;
      });

      toast({
        title: 'Success',
        description: 'Notification preferences updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive',
      });
    }
  }

  async function handleDigestChange(
    category: NotificationCategory,
    frequency: NotificationFrequency
  ) {
    if (!user || !preferences) return;

    try {
      await updateNotificationDigest(user.id, category, frequency);
      
      setPreferences(prev => {
        if (!prev) return prev;
        const newPrefs = { ...prev };
        newPrefs.categories[category].frequency = frequency;
        return newPrefs;
      });

      toast({
        title: 'Success',
        description: 'Notification digest preferences updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification digest preferences',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Preferences...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary"></div>
            <span>Loading your notification preferences</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Preferences</CardTitle>
          <CardDescription>
            We couldn't load your notification preferences. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadPreferences}>
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Notification Settings</CardTitle>
          <CardDescription>
            Control your overall notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="global-enabled">Enable All Notifications</Label>
            <Switch
              id="global-enabled"
              checked={preferences.global.enabled}
              onCheckedChange={(checked) => {
                setPreferences(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    global: { ...prev.global, enabled: checked },
                  };
                });
              }}
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="global-frequency">Default Frequency</Label>
            <Select
              value={preferences.global.frequency}
              onValueChange={(value: NotificationFrequency) => {
                setPreferences(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    global: { ...prev.global, frequency: value },
                  };
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {Object.entries(preferences.categories).map(([category, categoryPrefs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{CATEGORY_LABELS[category as NotificationCategory]}</CardTitle>
            <CardDescription>
              Manage notifications for {CATEGORY_LABELS[category as NotificationCategory].toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor={`category-${category}-enabled`}>
                  Enable {CATEGORY_LABELS[category as NotificationCategory]} Notifications
                </Label>
                <Switch
                  id={`category-${category}-enabled`}
                  checked={categoryPrefs.enabled}
                  onCheckedChange={(checked) => {
                    setPreferences(prev => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        categories: {
                          ...prev.categories,
                          [category]: {
                            ...prev.categories[category as NotificationCategory],
                            enabled: checked,
                          },
                        },
                      };
                    });
                  }}
                />
              </div>

              <div>
                <Label htmlFor={`category-${category}-frequency`}>Digest Frequency</Label>
                <Select
                  value={categoryPrefs.frequency}
                  onValueChange={(value: NotificationFrequency) => {
                    handleDigestChange(category as NotificationCategory, value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                {Object.entries(categoryPrefs.types).map(([type, typePrefs]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`type-${type}-enabled`}>
                        {TYPE_LABELS[type as NotificationType]}
                      </Label>
                      <Switch
                        id={`type-${type}-enabled`}
                        checked={typePrefs.enabled}
                        onCheckedChange={(checked) => {
                          handlePreferenceChange(
                            category as NotificationCategory,
                            type as NotificationType,
                            checked,
                            typePrefs.frequency
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Select
                        value={typePrefs.frequency}
                        onValueChange={(value: NotificationFrequency) => {
                          handlePreferenceChange(
                            category as NotificationCategory,
                            type as NotificationType,
                            typePrefs.enabled,
                            value
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 