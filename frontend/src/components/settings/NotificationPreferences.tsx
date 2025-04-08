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
import { useAuth } from '@/hooks/useAuth';
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
import { toast } from 'sonner';
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
      toast.error('Failed to load notification preferences');
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

      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notification preferences');
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

      toast.success('Notification digest preferences updated');
    } catch (error) {
      toast.error('Failed to update notification digest preferences');
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
              onCheckedChange={async (checked) => {
                try {
                  setPreferences(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      global: { ...prev.global, enabled: checked },
                    };
                  });

                  await updateNotificationPreference(
                    user!.id,
                    'account',
                    'account_updates',
                    checked,
                    preferences.global.frequency
                  );

                  toast.success('Global notification settings updated');
                } catch (error) {
                  setPreferences(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      global: { ...prev.global, enabled: !checked },
                    };
                  });

                  toast.error('Failed to update global notification settings');
                }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(preferences.categories).map(([category, categoryPrefs]) => (
          <Card key={category} className="h-full">
            <CardHeader>
              <CardTitle>{CATEGORY_LABELS[category as NotificationCategory]}</CardTitle>
              <CardDescription>
                Manage your {CATEGORY_LABELS[category as NotificationCategory].toLowerCase()} notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`category-${category}-enabled`}>
                    Enable all {CATEGORY_LABELS[category as NotificationCategory]} notifications
                  </Label>
                  <Switch
                    id={`category-${category}-enabled`}
                    checked={categoryPrefs.enabled}
                    onCheckedChange={async (checked) => {
                      if (!user || !preferences) return;
                      const typedCategory = category as NotificationCategory;

                      try {
                        setPreferences(prev => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            categories: {
                              ...prev.categories,
                              [typedCategory]: {
                                ...prev.categories[typedCategory],
                                enabled: checked,
                              },
                            },
                          };
                        });

                        await handleDigestChange(typedCategory, checked ? categoryPrefs.frequency : 'never');

                        const updatePromises = Object.entries(categoryPrefs.types).map(([type, typePrefs]) =>
                          updateNotificationPreference(
                            user.id,
                            typedCategory,
                            type as NotificationType,
                            checked,
                            typePrefs.frequency
                          )
                        );

                        await Promise.all(updatePromises);

                        toast.success(`${CATEGORY_LABELS[typedCategory]} notifications ${checked ? 'enabled' : 'disabled'}`);
                      } catch (error) {
                        setPreferences(prev => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            categories: {
                              ...prev.categories,
                              [typedCategory]: {
                                ...prev.categories[typedCategory],
                                enabled: !checked,
                              },
                            },
                          };
                        });

                        toast.error('Failed to update notification preferences');
                      }
                    }}
                  />
                </div>
                {categoryPrefs.enabled && (
                  <>
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
                              onCheckedChange={async (checked) => {
                                if (!user || !preferences) return;
                                const typedCategory = category as NotificationCategory;
                                const typedType = type as NotificationType;

                                try {
                                  setPreferences(prev => {
                                    if (!prev) return prev;
                                    const newPrefs = { ...prev };
                                    if (!newPrefs.categories[typedCategory].types[typedType]) {
                                      newPrefs.categories[typedCategory].types[typedType] = { enabled: checked, frequency: typePrefs.frequency };
                                    } else {
                                      newPrefs.categories[typedCategory].types[typedType]!.enabled = checked;
                                    }
                                    return newPrefs;
                                  });

                                  await handlePreferenceChange(
                                    typedCategory,
                                    typedType,
                                    checked,
                                    typePrefs.frequency
                                  );
                                } catch (error) {
                                  setPreferences(prev => {
                                    if (!prev) return prev;
                                    const newPrefs = { ...prev };
                                    if (!newPrefs.categories[typedCategory].types[typedType]) {
                                      newPrefs.categories[typedCategory].types[typedType] = { enabled: !checked, frequency: typePrefs.frequency };
                                    } else {
                                      newPrefs.categories[typedCategory].types[typedType]!.enabled = !checked;
                                    }
                                    return newPrefs;
                                  });

                                  toast.error('Failed to update notification preference');
                                }
                              }}
                            />
                          </div>
                          {typePrefs.enabled && (
                            <div className="flex items-center justify-between pl-4">
                              <Label htmlFor={`type-${type}-frequency`}>
                                Frequency
                              </Label>
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
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent className="bg-white shadow-lg z-50">
                                  {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 