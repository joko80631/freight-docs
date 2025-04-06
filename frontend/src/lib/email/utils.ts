import { createClient } from '@supabase/supabase-js';
import { EmailPreferences } from './types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Check if a user has opted in to emails
 * @param userId The user ID to check
 * @param category Optional category to check (e.g., "notifications", "marketing")
 * @returns Promise that resolves to true if the user has opted in, false otherwise
 */
export async function hasEmailOptIn(userId: string, category?: string): Promise<boolean> {
  try {
    // Fetch the user's profile with email preferences
    const { data, error } = await supabase
      .from('profiles')
      .select('email_preferences')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching email preferences:', error);
      return false; // Default to not sending if there's an error
    }
    
    if (!data || !data.email_preferences) {
      return false; // No preferences found, default to not sending
    }
    
    const preferences = data.email_preferences as EmailPreferences;
    
    // Check global opt-in first
    if (!preferences.global_enabled) {
      return false;
    }
    
    // If a category is specified, check category-specific preference
    if (category && preferences.categories && category in preferences.categories) {
      return preferences.categories[category];
    }
    
    // If we get here, the user has globally opted in and either:
    // 1. No category was specified, or
    // 2. The category doesn't have a specific preference
    return true;
  } catch (error) {
    console.error('Error checking email opt-in:', error);
    return false; // Default to not sending if there's an error
  }
}

/**
 * Log an email activity to the audit_logs table
 * @param userId The user ID who triggered the email
 * @param recipient The email recipient
 * @param template The email template used
 * @param action The action that triggered the email (default: "email_sent")
 */
export async function logEmailActivity(
  userId: string,
  recipient: string,
  template: string,
  action: string = 'email_sent'
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      email_recipient: recipient,
      email_template: template,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging email activity:', error);
    // Don't throw the error as this is a non-critical operation
  }
} 