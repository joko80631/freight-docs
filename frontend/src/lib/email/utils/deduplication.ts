import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

interface DeduplicationContext {
  templateName: string;
  recipientId: string;
  loadId?: string;
  documentId?: string;
  teamId?: string;
}

/**
 * Check if a similar email was sent recently
 * @param context The context of the email to check
 * @param hoursThreshold Hours within which to consider an email duplicate
 * @returns true if a similar email was sent recently
 */
export async function isDuplicateEmail(
  context: DeduplicationContext,
  hoursThreshold: number = 24
): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Build a query that includes all contextual identifiers
  let query = supabase
    .from('audit_logs')
    .select('created_at')
    .eq('category', 'email')
    .eq('template_name', context.templateName)
    .eq('user_id', context.recipientId)
    .eq('status', 'sent')
    .gte('created_at', new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  // Add contextual filters if provided
  if (context.loadId) {
    query = query.eq('metadata->loadId', context.loadId);
  }

  if (context.documentId) {
    query = query.eq('metadata->documentId', context.documentId);
  }

  if (context.teamId) {
    query = query.eq('metadata->teamId', context.teamId);
  }

  const { data: recentEmails, error } = await query;

  if (error) {
    console.error('Error checking for duplicate emails:', error);
    return false; // Allow send on error to prevent blocking legitimate emails
  }

  return recentEmails.length > 0;
}

/**
 * Check if a user has received too many emails recently
 * @param recipientId The user ID to check
 * @param hoursThreshold Hours within which to count emails
 * @param maxEmails Maximum number of emails allowed in the time period
 * @returns true if the user has received too many emails
 */
export async function isRateLimited(
  recipientId: string,
  hoursThreshold: number = 1,
  maxEmails: number = 10
): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: emailCount, error } = await supabase
    .from('audit_logs')
    .select('id', { count: 'exact' })
    .eq('category', 'email')
    .eq('user_id', recipientId)
    .eq('status', 'sent')
    .gte('created_at', new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error checking rate limit:', error);
    return false; // Allow send on error to prevent blocking legitimate emails
  }

  return (emailCount?.length || 0) >= maxEmails;
}

/**
 * Check if a load has triggered too many notifications recently
 * @param loadId The load ID to check
 * @param hoursThreshold Hours within which to count notifications
 * @param maxNotifications Maximum number of notifications allowed in the time period
 * @returns true if the load has triggered too many notifications
 */
export async function isLoadRateLimited(
  loadId: string,
  hoursThreshold: number = 24,
  maxNotifications: number = 5
): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: notificationCount, error } = await supabase
    .from('audit_logs')
    .select('id', { count: 'exact' })
    .eq('category', 'email')
    .eq('metadata->loadId', loadId)
    .eq('status', 'sent')
    .gte('created_at', new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error checking load rate limit:', error);
    return false; // Allow send on error to prevent blocking legitimate emails
  }

  return (notificationCount?.length || 0) >= maxNotifications;
} 