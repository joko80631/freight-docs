import { Resend } from 'resend';
import { EmailProvider, EmailOptions, SendResult, EmailRecipient } from '../types';
import { logEmailActivity } from '../utils/audit-log';

// Error types
export enum EmailErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface EmailError extends Error {
  type: EmailErrorType;
  statusCode?: number;
  code?: string;
  retryable: boolean;
  context?: Record<string, any>;
}

// Retry strategy configuration
export interface RetryStrategy {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry: (error: EmailError) => boolean;
  getDelay: (attempt: number) => number;
}

// Default retry strategy
const DEFAULT_RETRY_STRATEGY: RetryStrategy = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  shouldRetry: (error: EmailError) => error.retryable,
  getDelay: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000),
};

// Resend API response type
interface ResendEmailResponse {
  id: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  created_at: string;
}

export class ResendProvider implements EmailProvider {
  private client: Resend;
  private retryStrategy: RetryStrategy;

  constructor(apiKey: string, retryStrategy: Partial<RetryStrategy> = {}) {
    if (!apiKey) {
      throw new Error('Resend API key is required');
    }
    this.client = new Resend(apiKey);
    this.retryStrategy = { ...DEFAULT_RETRY_STRATEGY, ...retryStrategy };
  }

  /**
   * Classifies an error into an EmailError type
   */
  private classifyError(error: any): EmailError {
    const baseError: EmailError = {
      name: error.name || 'EmailError',
      message: error.message || 'Unknown error occurred',
      type: EmailErrorType.UNKNOWN_ERROR,
      retryable: false,
      context: {},
    };

    if (error?.statusCode) {
      if (error.statusCode === 429) {
        return {
          ...baseError,
          type: EmailErrorType.RATE_LIMIT,
          retryable: true,
          statusCode: error.statusCode,
        };
      }
      if (error.statusCode >= 500) {
        return {
          ...baseError,
          type: EmailErrorType.SERVER_ERROR,
          retryable: true,
          statusCode: error.statusCode,
        };
      }
      if (error.statusCode >= 400) {
        return {
          ...baseError,
          type: EmailErrorType.VALIDATION_ERROR,
          retryable: false,
          statusCode: error.statusCode,
        };
      }
    }

    if (error?.name === 'NetworkError' || error?.code === 'ECONNRESET') {
      return {
        ...baseError,
        type: EmailErrorType.NETWORK_ERROR,
        retryable: true,
        code: error.code,
      };
    }

    return baseError;
  }

  /**
   * Waits for a specified time
   */
  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Converts EmailRecipient to string format expected by Resend
   */
  private formatRecipient(recipient: EmailRecipient): string {
    return recipient.email;
  }

  /**
   * Converts array of EmailRecipients to array of strings
   */
  private formatRecipients(recipients: EmailRecipient | EmailRecipient[]): string | string[] {
    if (Array.isArray(recipients)) {
      return recipients.map(r => this.formatRecipient(r));
    }
    return this.formatRecipient(recipients);
  }

  /**
   * Sends an email with retry logic and error handling
   */
  async sendEmail(options: EmailOptions): Promise<SendResult> {
    if (!options.to || !options.subject || !options.content) {
      return {
        success: false,
        errors: [new Error('Missing required fields: to, subject, or content')],
      };
    }

    // Ensure we have required fields for audit logging
    const recipientId = options.userId || 'system';
    const templateName = options.templateName || 'direct';

    let lastError: EmailError | undefined;
    let attempt = 0;

    while (attempt <= this.retryStrategy.maxRetries) {
      try {
        // Log attempt
        console.log(`Email send attempt ${attempt + 1}/${this.retryStrategy.maxRetries + 1}`);
        
        const result = await this.client.emails.send({
          from: options.from || 'noreply@freightplatform.com',
          to: this.formatRecipients(options.to),
          cc: options.cc ? this.formatRecipients(options.cc) : undefined,
          bcc: options.bcc ? this.formatRecipients(options.bcc) : undefined,
          subject: options.subject,
          html: options.content,
          reply_to: options.replyTo ? this.formatRecipient(options.replyTo) : undefined,
          attachments: options.attachments?.map(attachment => ({
            filename: attachment.filename,
            content: attachment.content,
          })),
        });

        // Extract message ID from response
        const messageId = typeof result === 'object' && result !== null && 'id' in result 
          ? String(result.id) 
          : 'unknown';

        // Log successful send
        await logEmailActivity({
          recipientId,
          templateName,
          status: 'sent',
          metadata: {
            messageId,
            attempt: attempt + 1,
            ...options.metadata,
          },
        });

        return {
          success: true,
          messageId,
        };
      } catch (error) {
        lastError = this.classifyError(error);
        
        // Log failed attempt
        await logEmailActivity({
          recipientId,
          templateName,
          status: 'failed',
          metadata: {
            error: lastError,
            attempt: attempt + 1,
            ...options.metadata,
          },
        });

        // Check if we should retry
        if (attempt < this.retryStrategy.maxRetries && this.retryStrategy.shouldRetry(lastError)) {
          const delay = this.retryStrategy.getDelay(attempt);
          console.log(`Retrying in ${delay}ms...`);
          await this.wait(delay);
          attempt++;
          continue;
        }

        break;
      }
    }

    return {
      success: false,
      errors: [lastError || new Error('Unknown error occurred')],
    };
  }

  private async sendWithRetry(email: EmailMessage): Promise<void> {
    let attempt = 0;
    while (attempt <= this.retryStrategy.maxRetries) {
      try {
        await this.send(email);
        return;
      } catch (error) {
        if (attempt === this.retryStrategy.maxRetries) {
          throw error;
        }
        const delay = this.retryStrategy.getDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }
  }
} 