import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

interface NotificationDigest {
  id: string;
  user_id: string;
  category: string;
  frequency: string;
  last_sent_at: string | null;
  next_scheduled_at: string;
}

interface PendingNotification {
  id: string;
  user_id: string;
  category: string;
  type: string;
  data: Record<string, any>;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
}

async function getDigestContent(
  category: string,
  notifications: PendingNotification[]
): Promise<string> {
  const categoryLabels: Record<string, string> = {
    account: 'Account',
    documents: 'Documents',
    team: 'Team',
    loads: 'Loads',
    system: 'System',
    marketing: 'Marketing',
  };

  const typeLabels: Record<string, string> = {
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

  let content = `<h2>${categoryLabels[category]} Updates</h2>`;
  content += '<ul>';
  
  notifications.forEach(notification => {
    content += `<li>${typeLabels[notification.type]}</li>`;
  });
  
  content += '</ul>';
  return content;
}

async function processDigest(digest: NotificationDigest) {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', digest.user_id)
      .single();

    if (profileError || !profile) {
      throw new Error(`Failed to fetch user profile: ${profileError?.message}`);
    }

    // Get pending notifications for this category
    const { data: notifications, error: notificationsError } = await supabase
      .from('pending_notifications')
      .select('*')
      .eq('user_id', digest.user_id)
      .eq('category', digest.category)
      .is('processed_at', null);

    if (notificationsError) {
      throw new Error(`Failed to fetch pending notifications: ${notificationsError.message}`);
    }

    if (!notifications || notifications.length === 0) {
      // No notifications to send, update last sent time
      await supabase
        .from('notification_digests')
        .update({
          last_sent_at: new Date().toISOString(),
          next_scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', digest.id);
      return;
    }

    // Generate digest content
    const content = await getDigestContent(digest.category, notifications);

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'notifications@yourdomain.com',
      to: profile.email,
      subject: `${digest.category.charAt(0).toUpperCase() + digest.category.slice(1)} Updates`,
      html: content,
    });

    if (emailError) {
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    // Mark notifications as processed
    const notificationIds = notifications.map(n => n.id);
    const { error: updateError } = await supabase
      .from('pending_notifications')
      .update({
        processed_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
      })
      .in('id', notificationIds);

    if (updateError) {
      throw new Error(`Failed to update notifications: ${updateError.message}`);
    }

    // Update digest
    const { error: digestError } = await supabase
      .from('notification_digests')
      .update({
        last_sent_at: new Date().toISOString(),
        next_scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', digest.id);

    if (digestError) {
      throw new Error(`Failed to update digest: ${digestError.message}`);
    }
  } catch (error) {
    console.error(`Error processing digest ${digest.id}:`, error);
    throw error;
  }
}

serve(async (req) => {
  try {
    // Get all digests that are due
    const { data: digests, error: digestsError } = await supabase
      .from('notification_digests')
      .select('*')
      .lte('next_scheduled_at', new Date().toISOString());

    if (digestsError) {
      throw new Error(`Failed to fetch digests: ${digestsError.message}`);
    }

    if (!digests || digests.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No digests to process' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process each digest
    const results = await Promise.allSettled(
      digests.map(digest => processDigest(digest))
    );

    // Count successes and failures
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        message: `Processed ${digests.length} digests (${succeeded} succeeded, ${failed} failed)`,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing digests:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 