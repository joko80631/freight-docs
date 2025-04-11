import { EmailProvider, EmailOptions, SendResult, EmailRecipient } from '../types';

/**
 * Mock email provider for testing
 * Stores sent emails in memory and provides utilities for assertions
 */
export class MockProvider implements EmailProvider {
  private sentEmails: Array<{
    options: EmailOptions;
    timestamp: Date;
  }> = [];

  /**
   * Send an email (mock implementation)
   */
  async sendEmail(options: EmailOptions): Promise<SendResult> {
    // Store the email for later assertions
    this.sentEmails.push({
      options,
      timestamp: new Date(),
    });

    // Simulate successful send
    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    };
  }

  /**
   * Get all sent emails
   */
  getSentEmails() {
    return this.sentEmails;
  }

  /**
   * Get the last sent email
   */
  getLastSentEmail() {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  /**
   * Clear the sent emails history
   */
  clearSentEmails() {
    this.sentEmails = [];
  }

  /**
   * Assert that an email was sent with specific criteria
   */
  assertEmailSent(criteria: Partial<EmailOptions>) {
    const matchingEmail = this.sentEmails.find(({ options }) => {
      return Object.entries(criteria).every(([key, value]) => {
        if (key === 'to' && typeof value === 'string') {
          const to = options.to;
          if (Array.isArray(to)) {
            return to.some(recipient => recipient.email === value);
          }
          return to.email === value;
        }
        return options[key as keyof EmailOptions] === value;
      });
    });

    if (!matchingEmail) {
      throw new Error(
        `No email found matching criteria: ${JSON.stringify(criteria, null, 2)}`
      );
    }

    return matchingEmail;
  }

  /**
   * Assert that no emails were sent
   */
  assertNoEmailsSent() {
    if (this.sentEmails.length > 0) {
      throw new Error(
        `Expected no emails to be sent, but ${this.sentEmails.length} were sent`
      );
    }
  }

  /**
   * Assert that exactly N emails were sent
   */
  assertEmailsSentCount(count: number) {
    if (this.sentEmails.length !== count) {
      throw new Error(
        `Expected ${count} emails to be sent, but ${this.sentEmails.length} were sent`
      );
    }
  }
} 