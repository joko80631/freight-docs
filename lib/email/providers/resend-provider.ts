import { Resend } from 'resend';
import { EmailOptions, EmailProvider, SendResult } from '../types';

export class ResendProvider implements EmailProvider {
  private client: Resend;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Resend API key is required');
    }
    this.client = new Resend(apiKey);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private normalizeRecipients(recipients: EmailOptions['to']): string[] {
    if (!recipients) return [];
    const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
    return recipientArray.map(r => r.email);
  }

  async sendEmail(options: EmailOptions): Promise<SendResult> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.emails.send({
          from: 'Freight Document Platform <noreply@yourdomain.com>',
          to: this.normalizeRecipients(options.to),
          cc: options.cc ? this.normalizeRecipients(options.cc) : undefined,
          bcc: options.bcc ? this.normalizeRecipients(options.bcc) : undefined,
          subject: options.subject,
          html: options.content,
          reply_to: options.replyTo?.email,
          attachments: options.attachments?.map(attachment => ({
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
          })),
        });

        return {
          success: true,
          messageId: response.id,
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
          continue;
        }
      }
    }

    return {
      success: false,
      errors: [lastError!],
    };
  }
} 