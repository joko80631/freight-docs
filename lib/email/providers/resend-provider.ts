import { EmailProvider, EmailOptions, SendResult, EmailRecipient } from '../types';
import { Resend } from 'resend';

export class ResendProvider implements EmailProvider {
  private resend: Resend;
  private retryCount: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  private formatRecipient(recipient: EmailRecipient): string {
    return recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;
  }

  async sendEmail(options: EmailOptions): Promise<SendResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const recipientEmail = Array.isArray(options.to) 
          ? options.to[0].email 
          : options.to.email;

        const recipientName = Array.isArray(options.to)
          ? options.to[0].name
          : options.to.name;

        const response = await this.resend.emails.send({
          from: options.from || process.env.RESEND_FROM_EMAIL || 'no-reply@freight.app',
          to: recipientName ? `${recipientName} <${recipientEmail}>` : recipientEmail,
          subject: options.subject,
          html: options.content,
          reply_to: options.replyTo?.email,
          cc: Array.isArray(options.cc) ? options.cc.map(this.formatRecipient) : undefined,
          bcc: Array.isArray(options.bcc) ? options.bcc.map(this.formatRecipient) : undefined,
          attachments: options.attachments?.map(a => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType,
          })),
        });

        return {
          success: true,
          messageId: response.data?.id,
        };
      } catch (error) {
        lastError = error as Error;
        
        // If this is not the last attempt, wait before retrying
        if (attempt < this.retryCount) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
          continue;
        }
      }
    }

    return {
      success: false,
      errors: lastError ? [lastError] : [new Error('Failed to send email')],
    };
  }
} 