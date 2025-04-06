import { createClient } from '@supabase/supabase-js';
import {
  NotificationPreference,
  NotificationDigest,
  NotificationPreferences,
  NotificationCategory,
  NotificationType,
  NotificationFrequency,
} from '../types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const { data: preferences, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch notification preferences: ${error.message}`);
  }

  // Transform the flat preferences into a nested structure
  const transformedPreferences: NotificationPreferences = {
    global: {
      enabled: true,
      frequency: 'immediate',
    },
    categories: {} as NotificationPreferences['categories'],
  };

  // Initialize categories
  const categories: NotificationCategory[] = ['account', 'documents', 'team', 'loads', 'system', 'marketing'];
  categories.forEach(category => {
    transformedPreferences.categories[category] = {
      enabled: true,
      frequency: 'immediate',
      types: {},
    };
  });

  // Populate with actual preferences
  preferences.forEach(pref => {
    const category = pref.category as NotificationCategory;
    const type = pref.type as NotificationType;

    if (!transformedPreferences.categories[category].types[type]) {
      transformedPreferences.categories[category].types[type] = {
        enabled: pref.enabled,
        frequency: pref.frequency,
      };
    }

    // Update category settings based on type preferences
    if (pref.enabled) {
      transformedPreferences.categories[category].enabled = true;
    }
  });

  return transformedPreferences;
}

export async function updateNotificationPreference(
  userId: string,
  category: NotificationCategory,
  type: NotificationType,
  enabled: boolean,
  frequency: NotificationFrequency
): Promise<void> {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      category,
      type,
      enabled,
      frequency,
    });

  if (error) {
    throw new Error(`Failed to update notification preference: ${error.message}`);
  }
}

export async function updateNotificationDigest(
  userId: string,
  category: NotificationCategory,
  frequency: NotificationFrequency
): Promise<void> {
  const { error } = await supabase
    .from('notification_digests')
    .upsert({
      user_id: userId,
      category,
      frequency,
      next_scheduled_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Failed to update notification digest: ${error.message}`);
  }
}

export async function getNotificationDigests(userId: string): Promise<NotificationDigest[]> {
  const { data, error } = await supabase
    .from('notification_digests')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch notification digests: ${error.message}`);
  }

  return data;
}

export async function getPendingNotifications(userId: string): Promise<NotificationPreference[]> {
  const { data, error } = await supabase
    .from('pending_notifications')
    .select('*')
    .eq('user_id', userId)
    .is('processed_at', null);

  if (error) {
    throw new Error(`Failed to fetch pending notifications: ${error.message}`);
  }

  return data;
}

export async function markNotificationAsProcessed(
  notificationId: string,
  success: boolean,
  error?: any
): Promise<void> {
  const { error: updateError } = await supabase
    .from('pending_notifications')
    .update({
      processed_at: new Date().toISOString(),
      sent_at: success ? new Date().toISOString() : null,
      error: error ? JSON.stringify(error) : null,
    })
    .eq('id', notificationId);

  if (updateError) {
    throw new Error(`Failed to mark notification as processed: ${updateError.message}`);
  }
}

export function getDefaultPreferencesByRole(role: string): NotificationPreferences {
  const defaultPreferences: NotificationPreferences = {
    global: {
      enabled: true,
      frequency: 'immediate',
    },
    categories: {} as NotificationPreferences['categories'],
  };

  const categories: NotificationCategory[] = ['account', 'documents', 'team', 'loads', 'system', 'marketing'];
  
  categories.forEach(category => {
    defaultPreferences.categories[category] = {
      enabled: role === 'admin' || 
        (role === 'document_manager' && ['documents', 'loads'].includes(category)) ||
        (role === 'load_manager' && category === 'loads') ||
        (role === 'user' && ['account', 'team'].includes(category)),
      frequency: category === 'marketing' ? 'weekly' : 
                ['account', 'security_alerts'].includes(category) ? 'immediate' : 
                'daily',
      types: {},
    };
  });

  return defaultPreferences;
} 