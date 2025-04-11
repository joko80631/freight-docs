import { EmailProvider, EmailOptions, SendResult } from '../types';

export class MockProvider implements EmailProvider {
  private sentEmails: EmailOptions[] = [];

  async sendEmail(options: EmailOptions): Promise<SendResult> {
    console.log('Mock email sent:', {
      to: options.to,
      subject: options.subject,
      content: options.content,
    });
    this.sentEmails.push(options);
    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    };
  }

  getSentEmails(): EmailOptions[] {
    return this.sentEmails;
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }
} 