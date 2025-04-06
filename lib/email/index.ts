import { EmailProvider, EmailOptions, SendResult } from './types';
import { ResendProvider } from './providers/resend';
import { hasEmailOptIn, logEmailActivity } from './utils';
import { renderTemplate } from './templates';
import { generateUnsubscribeToken } from '../utils/unsubscribe-token';

// Initialize the email provider with the API key from environment variables
const emailProvider: EmailProvider = new ResendProvider(process.env.RESEND_API_KEY || '');

// Environment-based recipient redirection
const EMAIL_SANDBOX_OVERRIDE = process.env.EMAIL_SANDBOX_OVERRIDE || 'dev@example.com';
const isProduction = process.env.NODE_ENV === 'production';

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
      await logEmailActivity({
        recipientId: userId,
        templateName,
        status: 'skipped',
        metadata: {
          reason: 'preference_disabled',
          category
        }
      });
      
      return { success: false, error: 'User has opted out of emails' };
    }

    // In non-production environments, redirect emails to sandbox
    if (!isProduction) {
      const originalTo = options.to;
      options.to = { email: EMAIL_SANDBOX_OVERRIDE, name: 'Sandbox User' };
      
      // Add original recipient to metadata
      const metadata = {
        originalTo: typeof originalTo === 'string' ? originalTo : originalTo.email,
        environment: process.env.NODE_ENV
      };
      
      // Log sandbox redirection
      console.log(`Email redirected to sandbox: ${JSON.stringify(metadata)}`);
    }

    // Send the email
    const result = await emailProvider.send(options);

    // Log the email activity
    if (result.success) {
      await logEmailActivity({
        recipientId: userId,
        templateName,
        status: 'sent',
        metadata: {
          messageId: result.messageId,
          category
        }
      });
    } else {
      await logEmailActivity({
        recipientId: userId,
        templateName,
        status: 'failed',
        error: result.error,
        metadata: {
          category
        }
      });
    }

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log the error
    await logEmailActivity({
      recipientId: userId,
      templateName,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        category
      }
    });
    
    return { success: false, error: 'Failed to send email' };
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
  templateName: string,
  data: Record<string, any>,
  to: EmailOptions['to'],
  options: {
    subject?: string;
    cc?: EmailOptions['cc'];
    bcc?: EmailOptions['bcc'];
    attachments?: EmailOptions['attachments'];
    replyTo?: string;
    userId?: string;
    category?: string;
    unsubscribeUrl?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<SendResult> {
  try {
    // Generate unsubscribe token if not provided
    let unsubscribeUrl = options.unsubscribeUrl;
    if (!unsubscribeUrl && typeof to === 'object' && to.email) {
      const scope = options.category || 'all';
      const token = generateUnsubscribeToken(to.email, scope);
      unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${token}`;
    }

    // Render the template
    const content = renderTemplate(templateName, {
      ...data,
      unsubscribeUrl
    });

    // Send the email
    return await sendEmail({
      to,
      subject: options.subject || data.title || 'Notification from Freight Document Platform',
      content,
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

// Re-export types and utilities
export * from './types';
export * from './templates'; 