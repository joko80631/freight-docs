import { EmailProvider, EmailOptions, SendResult } from './types';
import { ResendProvider } from './providers/resend';
import { hasEmailOptIn, logEmailActivity } from './utils';
import { renderTemplate, type TemplateName, type SpecificTemplateData } from './templates';
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
  templateName?: TemplateName,
  category?: string
): Promise<SendResult> {
  try {
    // Check if the user has opted in to emails
    if (userId && !(await hasEmailOptIn(userId, category))) {
      console.log(`User ${userId} has opted out of ${category || 'all'} emails`);
      
      const recipientEmail = Array.isArray(options.to) 
        ? options.to[0].email 
        : options.to.email;

      await logEmailActivity(
        userId,
        recipientEmail,
        templateName || 'unknown',
        'email_skipped'
      );
      
      return { success: false, errors: [new Error('User has opted out of emails')] };
    }

    // In non-production environments, redirect emails to sandbox
    if (!isProduction) {
      const originalTo = options.to;
      options.to = { email: EMAIL_SANDBOX_OVERRIDE, name: 'Sandbox User' };
      
      // Add original recipient to metadata
      const metadata = {
        originalTo: Array.isArray(originalTo) 
          ? originalTo.map(r => r.email) 
          : originalTo.email,
        environment: process.env.NODE_ENV
      };
      
      // Log sandbox redirection
      console.log(`Email redirected to sandbox: ${JSON.stringify(metadata)}`);
    }

    // Send the email
    const result = await emailProvider.sendEmail(options);

    // Log the email activity
    if (result.success) {
      const recipientEmail = Array.isArray(options.to) 
        ? options.to[0].email 
        : options.to.email;

      await logEmailActivity(
        userId || 'system',
        recipientEmail,
        templateName || 'unknown',
        'email_sent'
      );
    } else {
      const recipientEmail = Array.isArray(options.to) 
        ? options.to[0].email 
        : options.to.email;

      await logEmailActivity(
        userId || 'system',
        recipientEmail,
        templateName || 'unknown',
        'email_failed'
      );
    }

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      errors: [error instanceof Error ? error : new Error('Unknown error')] 
    };
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
  data: SpecificTemplateData,
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
    if (!unsubscribeUrl && typeof to === 'object' && !Array.isArray(to) && to.email) {
      const scope = options.category || 'all';
      const token = generateUnsubscribeToken(to.email, scope);
      unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${token}`;
    }

    // Render the template
    const rendered = await renderTemplate(templateName, {
      ...data,
      unsubscribeUrl
    } as SpecificTemplateData);

    // Send the email
    return await sendEmail({
      to,
      subject: options.subject || rendered.subject,
      content: rendered.html,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
      replyTo: options.replyTo ? { email: options.replyTo } : undefined,
      metadata: {
        ...options.metadata,
        templateName,
        templateVersion: rendered.version
      }
    }, options.userId, templateName, options.category);
  } catch (error) {
    console.error('Error sending templated email:', error);
    return { 
      success: false, 
      errors: [error instanceof Error ? error : new Error('Unknown error')] 
    };
  }
}

// Re-export types and utilities
export * from './types';
export * from './templates'; 