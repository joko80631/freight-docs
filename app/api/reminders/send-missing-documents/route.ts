import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
// import { sendMissingDocumentReminder } from '@/lib/notifications';
import { getCurrentUser } from '@/lib/auth';
import { renderTemplate } from '@/lib/email/templates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Get current user for authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { loadId, documentTypes, recipients } = await req.json();

    if (!loadId || !documentTypes || !recipients) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get load details
    const { data: load, error: loadError } = await supabase
      .from('loads')
      .select('*, team:teams(*)')
      .eq('id', loadId)
      .single();

    if (loadError || !load) {
      return NextResponse.json(
        { error: 'Load not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this load's team
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', load.team_id)
      .eq('user_id', user.id)
      .single();

    if (!teamMember) {
      return NextResponse.json(
        { error: 'You do not have access to this load' },
        { status: 403 }
      );
    }

    // Get missing documents
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('load_id', loadId)
      .in('type', documentTypes);

    if (documentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Find missing document types
    const existingTypes = new Set(documents?.map(doc => doc.type) || []);
    const missingTypes = documentTypes.filter((type: string) => !existingTypes.has(type));

    if (missingTypes.length === 0) {
      return NextResponse.json(
        { error: 'No missing documents found' },
        { status: 400 }
      );
    }

    // Process each recipient
    const results = [];
    for (const recipientId of recipients) {
      try {
        // Get recipient details
        const { data: recipient, error: recipientError } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', recipientId)
          .single();

        if (recipientError || !recipient) {
          results.push({
            recipientId,
            success: false,
            message: 'Recipient not found'
          });
          continue;
        }

        // Check if user is unsubscribed
        const { data: unsubscribed } = await supabase
          .from('unsubscribed_emails')
          .select('email')
          .eq('email', recipient.email)
          .single();

        if (unsubscribed) {
          results.push({
            recipientId,
            success: false,
            message: 'User has unsubscribed'
          });
          continue;
        }

        // Generate email content for each missing document type
        for (const docType of missingTypes) {
          const templateData = {
            documentType: docType,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
            loadNumber: load.load_number,
            recipientName: recipient.full_name,
            uploadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/loads/${loadId}/documents/upload?type=${docType}`,
            unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}`
          };

          const rendered = await renderTemplate('missing-document', templateData);

          // Send email using Resend
          await resend.emails.send({
            from: 'Hullgate <no-reply@hullgate.com>',
            to: recipient.email,
            subject: rendered.subject,
            html: rendered.html,
          });

          // Log email activity
          await supabase.from('email_logs').insert({
            template_name: 'missing-document',
            recipient: recipient.email,
            status: 'sent',
            metadata: {
              load_id: loadId,
              document_type: docType,
              recipient_id: recipientId
            }
          });
        }

        results.push({
          recipientId,
          success: true,
          message: 'Reminder sent successfully'
        });
      } catch (error) {
        console.error(`Error processing recipient ${recipientId}:`, error);
        results.push({
          recipientId,
          success: false,
          message: 'Failed to send reminder'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Document reminders processed',
      results
    });
  } catch (error) {
    console.error('Error sending document reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 