import { createClient } from '@supabase/supabase-js';

interface EmailActivityLog {
  recipientId: string;
  templateName: string;
  status: 'success' | 'failure';
  error?: string;
  metadata?: Record<string, any>;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Log an email activity to the audit logs
 */
export async function logEmailActivity(log: EmailActivityLog): Promise<void> {
  await supabase.from('email_activity_logs').insert({
    recipient_id: log.recipientId,
    template_name: log.templateName,
    status: log.status,
    error: log.error,
    metadata: log.metadata,
    created_at: new Date().toISOString(),
  });
}

/**
 * Get email activity logs for a user
 */
export async function getUserEmailLogs(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: 'sent' | 'failed' | 'skipped';
    templateName?: string;
  } = {}
): Promise<any[]> {
  const supabase = createClient();

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('category', 'email')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.templateName) {
    query = query.eq('template_name', options.templateName);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching email logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get email activity logs for a load
 */
export async function getLoadEmailLogs(
  loadId: string,
  options: {
    limit?: number;
    offset?: number;
    status?: 'sent' | 'failed' | 'skipped';
  } = {}
): Promise<any[]> {
  const supabase = createClient();

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('category', 'email')
    .eq('metadata->loadId', loadId)
    .order('created_at', { ascending: false });

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching load email logs:', error);
    return [];
  }

  return data || [];
} 