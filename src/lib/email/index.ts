import { ResendProvider } from './providers/resend';
import { EmailProvider, EmailOptions, SendResult } from './types';
import { renderTemplate, TemplateName, TemplateData } from './templates';

// Single email provider instance
const emailProvider: EmailProvider = new ResendProvider(process.env.RESEND_API_KEY || '');

// Unified email sending function
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  try {
    // Environment-based recipient redirection
    if (process.env.NODE_ENV !== 'production') {
      options.to = process.env.EMAIL_SANDBOX_OVERRIDE || 'dev@example.com';
    }

    return await emailProvider.send(options);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Template-based email sending
export async function sendTemplatedEmail(
  templateName: TemplateName,
  data: TemplateData,
  options: Partial<EmailOptions> = {}
): Promise<SendResult> {
  const template = await renderTemplate(templateName, data);
  
  return sendEmail({
    ...options,
    subject: options.subject || template.subject,
    html: template.html,
  });
} 