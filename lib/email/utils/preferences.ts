import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export type EmailPreferenceType = 'all' | 'team_invites' | 'missing_documents' | 'classification_results';

export interface EmailPreferences {
  enabled: boolean;
  preferences: {
    [key in EmailPreferenceType]: boolean;
  };
}

/**
 * Get a user's email preferences
 */
export async function getUserEmailPreferences(userId: string): Promise<EmailPreferences> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('email_preferences')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching email preferences:', error);
    // Default to enabled if we can't fetch preferences
    return {
      enabled: true,
      preferences: {
        all: true,
        team_invites: true,
        missing_documents: true,
        classification_results: true,
      },
    };
  }

  return profile.email_preferences || {
    enabled: true,
    preferences: {
      all: true,
      team_invites: true,
      missing_documents: true,
      classification_results: true,
    },
  };
}

/**
 * Check if a user has opted in to a specific type of email
 */
export async function hasEmailOptIn(
  userId: string,
  type: EmailPreferenceType
): Promise<boolean> {
  const preferences = await getUserEmailPreferences(userId);
  
  // If all emails are disabled, return false
  if (!preferences.enabled) {
    return false;
  }

  // If all emails are enabled, return true
  if (preferences.preferences.all) {
    return true;
  }

  // Check specific preference
  return preferences.preferences[type] || false;
}

/**
 * Get recipients for a notification based on type and context
 */
export async function getNotificationRecipients(
  type: EmailPreferenceType,
  context: {
    teamId?: string;
    loadId?: string;
    documentId?: string;
    excludeUserIds?: string[];
  }
): Promise<string[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('team_members')
    .select('user_id, role, profiles!inner(email_preferences)')
    .eq('profiles.email_preferences->enabled', true);

  // Add type-specific filters
  if (type === 'team_invites') {
    // Only team admins get team invites
    query = query.eq('role', 'admin');
  } else if (type === 'missing_documents') {
    // Team admins and document managers get missing document alerts
    query = query.in('role', ['admin', 'document_manager']);
  } else if (type === 'classification_results') {
    // Team admins and document managers get classification results
    query = query.in('role', ['admin', 'document_manager']);
  }

  // Add context-specific filters
  if (context.teamId) {
    query = query.eq('team_id', context.teamId);
  }

  // Exclude specific users if provided
  if (context.excludeUserIds?.length) {
    query = query.not('user_id', 'in', context.excludeUserIds);
  }

  const { data: members, error } = await query;

  if (error) {
    console.error('Error fetching notification recipients:', error);
    return [];
  }

  // Filter by email preferences
  const recipients = members
    .filter(member => {
      // Since we know it's a 1:1 relationship, we can safely access the first profile
      const profile = member.profiles[0];
      if (!profile) return false;
      
      const preferences = profile.email_preferences as EmailPreferences;
      return preferences.enabled && (preferences.preferences.all || preferences.preferences[type]);
    })
    .map(member => member.user_id);

  return recipients;
} 