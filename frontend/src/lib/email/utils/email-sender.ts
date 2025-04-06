import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { renderEmailTemplate } from './template-renderer';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EmailData {
  [key: string]: any;
}

interface SendTemplatedEmailParams {
  to: string;
  templateId: string;
  data: EmailData;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

export async function sendTemplatedEmail({
  to,
  templateId,
  data,
  from = process.env.EMAIL_FROM_ADDRESS || 'notifications@freight.com',
  replyTo,
  cc,
  bcc,
  attachments,
}: SendTemplatedEmailParams) {
  try {
    // Get template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) {
      throw new Error(`Failed to fetch template: ${templateError.message}`);
    }

    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Render template with data synchronously
    const renderedContent = renderEmailTemplate(template.content, data);
    const renderedSubject = renderEmailTemplate(template.subject, data);

    // Send email using Resend
    const result = await resend.emails.send({
      from,
      to,
      subject: renderedSubject,
      html: renderedContent,
      replyTo: replyTo,
      cc,
      bcc,
      attachments,
    });

    return result;
  } catch (error) {
    console.error('Error sending templated email:', error);
    throw error;
  }
} 