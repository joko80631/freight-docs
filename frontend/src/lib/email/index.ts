import { EmailProvider, EmailOptions, SendResult, EmailRecipient } from './types';
import { ResendProvider } from './providers/resend';
import { hasEmailOptIn, logEmailActivity } from './utils';
import { renderTemplate, TemplateName, TemplateData } from './templates';
import { generateUnsubscribeToken } from '../unsubscribe-token';

// Initialize the email provider with the API key from environment variables
const emailProvider: EmailProvider = new ResendProvider(process.env.RESEND_API_KEY || '');

// Environment-based recipient redirection
const EMAIL_SANDBOX_OVERRIDE = process.env.EMAIL_SANDBOX_OVERRIDE || 'dev@example.com';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get the email address from an EmailRecipient or EmailRecipient[]
 */
function getEmailAddress(recipient: EmailRecipient | EmailRecipient[]): string {
  if (Array.isArray(recipient)) {
    return recipient[0]?.email || '';
  }
  return recipient.email;
}

/**
 * Send an email
 * @param options The email options
 * @param userId The ID of the user sending the email (for audit logging)
 * @param templateName The name of the template used (for audit logging)
 * @param category The category of the email (for audit logging)
 * @returns Promise that resolves to the send result
 */
export async function sendEmail(
  options: EmailOptions,
  userId?: string,
  templateName?: string,
  category?: string
): Promise<SendResult> {
  try {
    // Check if the user has opted in to emails
    if (userId && !(await hasEmailOptIn(userId, category))) {
      console.log(`User ${userId} has opted out of ${category || 'all'} emails`);
      
      // Log skipped email due to preference
      await logEmailActivity(
        userId,
        getEmailAddress(options.to),
        templateName || 'unknown',
        'skipped'
      );
      
      return { success: false, errors: [new Error('User has opted out of emails')] };
    }

    // In non-production environments, redirect emails to sandbox
    if (!isProduction) {
      const originalTo = options.to;
      options.to = { email: EMAIL_SANDBOX_OVERRIDE, name: 'Sandbox User' };
      
      // Add original recipient to metadata
      const metadata = {
        originalTo: getEmailAddress(originalTo),
        environment: process.env.NODE_ENV
      };
      
      // Log sandbox redirection
      console.log(`Email redirected to sandbox: ${JSON.stringify(metadata)}`);
    }

    // Send the email
    const result = await emailProvider.sendEmail(options);

    // Log the email activity
    if (result.success) {
      await logEmailActivity(
        userId || 'system',
        getEmailAddress(options.to),
        templateName || 'unknown',
        'sent'
      );
    } else {
      await logEmailActivity(
        userId || 'system',
        getEmailAddress(options.to),
        templateName || 'unknown',
        'failed'
      );
    }

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log the error
    await logEmailActivity(
      userId || 'system',
      getEmailAddress(options.to),
      templateName || 'unknown',
      'failed'
    );
    
    return { success: false, errors: [error instanceof Error ? error : new Error('Unknown error')] };
  }
}

/**
 * Send an email using a template
 * @param templateName The name of the template to use
 * @param data The data to pass to the template
 * @param to The recipient of the email
 * @param options Additional options for the email
 * @returns A promise that resolves when the email is sent
 */
export async function sendTemplatedEmail(
  templateName: TemplateName,
  data: TemplateData,
  to: EmailOptions['to'],
  options: {
    subject?: string;
    cc?: EmailOptions['cc'];
    bcc?: EmailOptions['bcc'];
    attachments?: EmailOptions['attachments'];
    replyTo?: EmailRecipient;
    userId?: string;
    category?: string;
    unsubscribeUrl?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<SendResult> {
  try {
    // Generate unsubscribe token if not provided
    let unsubscribeUrl = options.unsubscribeUrl;
    if (!unsubscribeUrl && !Array.isArray(to) && to.email) {
      const scope = options.category || 'all';
      const token = generateUnsubscribeToken(to.email, scope);
      unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${token}`;
    }

    // Render the template
    const emailTemplate = await renderTemplate(templateName, {
      ...data,
      unsubscribeUrl
    });

    // Send the email
    return await sendEmail({
      to,
      subject: options.subject || emailTemplate.subject || 'Notification from Freight Document Platform',
      content: emailTemplate.html,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
      replyTo: options.replyTo,
    }, options.userId, templateName, options.category);
  } catch (error) {
    console.error('Error sending templated email:', error);
    throw error;
  }
}

// Re-export specific types and utilities instead of using star exports
export type { 
  EmailRecipient, 
  EmailAttachment, 
  EmailTemplate, 
  RenderedEmailTemplate, 
  EmailOptions, 
  SendResult, 
  EmailProvider,
  EmailPreferences,
  NotificationCategory,
  NotificationType,
  NotificationFrequency,
  NotificationPreference,
  NotificationDigest,
  PendingNotification,
  NotificationPreferences,
  NotificationDigestPreferences
} from './types';

export { 
  renderTemplate, 
  validateTemplateData, 
  getTemplateVersion 
} from './templates'; 