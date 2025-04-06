/**
 * Email recovery system for handling failed emails
 */

import { EmailOptions } from './types';
import { EmailError, EmailSendError, isRetryableError } from './errors';
import { getEmailMonitoringService, EmailEventType } from './monitoring';
import { getEmailProvider } from './providers/factory';

/**
 * Maximum number of retry attempts
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Delay between retry attempts (in milliseconds)
 */
const RETRY_DELAY = 5 * 60 * 1000; // 5 minutes

/**
 * Email retry record
 */
export interface EmailRetryRecord {
  id: string;
  originalEmailId: string;
  recipient: string;
  subject: string;
  templateName?: string;
  attempts: number;
  lastAttempt: Date;
  nextAttempt: Date;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  options: EmailOptions;
}

/**
 * Email recovery service
 */
export class EmailRecoveryService {
  private static instance: EmailRecoveryService;
  private retryQueue: EmailRetryRecord[] = [];
  private monitoringService = getEmailMonitoringService();
  private bouncedAddresses: Map<string, { reason: string; timestamp: Date }> = new Map();

  private constructor() {
    // Set up periodic retry processing
    this.startRetryProcessor();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): EmailRecoveryService {
    if (!EmailRecoveryService.instance) {
      EmailRecoveryService.instance = new EmailRecoveryService();
    }
    return EmailRecoveryService.instance;
  }

  /**
   * Add a failed email to the retry queue
   */
  public addToRetryQueue(
    originalEmailId: string,
    options: EmailOptions,
    error: Error,
    templateName?: string
  ): EmailRetryRecord | null {
    // Get recipient email
    const recipient = typeof options.to === 'string' ? options.to : options.to.email;
    
    // Skip if this address has bounced
    if (this.isBouncedAddress(recipient)) {
      console.log(`Skipping retry for bounced address: ${recipient}`);
      return null;
    }
    
    // Only retry if the error is retryable
    if (!isRetryableError(error)) {
      return null;
    }

    // Create retry record
    const retryRecord: EmailRetryRecord = {
      id: crypto.randomUUID(),
      originalEmailId,
      recipient,
      subject: options.subject,
      templateName,
      attempts: 0,
      lastAttempt: new Date(),
      nextAttempt: new Date(Date.now() + RETRY_DELAY),
      error: error instanceof EmailError
        ? {
            code: error.code,
            message: error.message,
            details: error.details,
          }
        : {
            code: 'UNKNOWN_ERROR',
            message: error.message,
          },
      options,
    };

    // Add to retry queue
    this.retryQueue.push(retryRecord);

    // Log the retry attempt
    this.monitoringService.logEvent({
      type: EmailEventType.RETRIED,
      emailId: retryRecord.id,
      templateName: retryRecord.templateName,
      recipient: retryRecord.recipient,
      error: retryRecord.error,
      metadata: {
        originalEmailId: retryRecord.originalEmailId,
        attempt: retryRecord.attempts + 1,
        subject: retryRecord.subject,
      },
    });

    return retryRecord;
  }

  /**
   * Get all retry records
   */
  public getRetryRecords(): EmailRetryRecord[] {
    return [...this.retryQueue];
  }

  /**
   * Get retry record by ID
   */
  public getRetryRecordById(id: string): EmailRetryRecord | undefined {
    return this.retryQueue.find(record => record.id === id);
  }

  /**
   * Get retry records for a specific recipient
   */
  public getRetryRecordsByRecipient(recipient: string): EmailRetryRecord[] {
    return this.retryQueue.filter(record => record.recipient === recipient);
  }

  /**
   * Manually retry a specific email
   */
  public async retryEmail(id: string): Promise<boolean> {
    const record = this.getRetryRecordById(id);
    if (!record) {
      return false;
    }

    return this.processRetry(record);
  }

  /**
   * Remove a retry record from the queue
   */
  public removeRetryRecord(id: string): boolean {
    const initialLength = this.retryQueue.length;
    this.retryQueue = this.retryQueue.filter(record => record.id !== id);
    return this.retryQueue.length < initialLength;
  }

  /**
   * Start the retry processor
   */
  private startRetryProcessor(): void {
    // Process retries every minute
    setInterval(() => {
      this.processRetryQueue();
    }, 60 * 1000);
  }

  /**
   * Process the retry queue
   */
  private async processRetryQueue(): Promise<void> {
    const now = new Date();
    const recordsToProcess = this.retryQueue.filter(
      record => record.nextAttempt <= now && record.attempts < MAX_RETRY_ATTEMPTS
    );

    for (const record of recordsToProcess) {
      // Skip if this address has bounced since being added to the queue
      if (this.isBouncedAddress(record.recipient)) {
        console.log(`Skipping retry for bounced address: ${record.recipient}`);
        this.removeRetryRecord(record.id);
        continue;
      }
      
      await this.processRetry(record);
    }
  }

  /**
   * Process a single retry
   */
  private async processRetry(record: EmailRetryRecord): Promise<boolean> {
    try {
      // Increment attempt counter
      record.attempts++;
      record.lastAttempt = new Date();
      record.nextAttempt = new Date(Date.now() + RETRY_DELAY);

      // Get email provider
      const provider = getEmailProvider();

      // Send the email
      const result = await provider.sendEmail(record.options);

      if (result.success) {
        // Log successful retry
        this.monitoringService.logRetriedEmail(
          record.originalEmailId,
          result.emailId,
          record.options
        );

        // Remove from retry queue
        this.removeRetryRecord(record.id);
        return true;
      } else {
        // Update error information
        record.error = {
          code: result.error?.code || 'SEND_ERROR',
          message: result.error?.message || 'Failed to send email',
          details: result.error?.details,
        };

        // If max attempts reached, remove from queue
        if (record.attempts >= MAX_RETRY_ATTEMPTS) {
          this.removeRetryRecord(record.id);
        }

        return false;
      }
    } catch (error) {
      // Update error information
      record.error = error instanceof EmailError
        ? {
            code: error.code,
            message: error.message,
            details: error.details,
          }
        : {
            code: 'UNKNOWN_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
          };

      // If max attempts reached, remove from queue
      if (record.attempts >= MAX_RETRY_ATTEMPTS) {
        this.removeRetryRecord(record.id);
      }

      return false;
    }
  }

  /**
   * Handle an email bounce
   * This should be called when a bounce webhook is received from the email provider
   */
  public handleBounce(emailId: string, recipient: string, reason: string): void {
    // Log the bounce event
    this.monitoringService.logBouncedEmail(emailId, recipient, reason);
    
    // Add to bounced addresses
    this.bouncedAddresses.set(recipient, {
      reason,
      timestamp: new Date()
    });
    
    // Remove any pending retries for this recipient
    const recipientRetries = this.getRetryRecordsByRecipient(recipient);
    for (const retry of recipientRetries) {
      this.removeRetryRecord(retry.id);
    }
    
    // In a real implementation, this would update the user's email preferences in the database
    // to mark this address as bounced
    console.log(`Marked email address as bounced: ${recipient}, reason: ${reason}`);
  }
  
  /**
   * Check if an email address has bounced
   */
  public isBouncedAddress(email: string): boolean {
    return this.bouncedAddresses.has(email);
  }
  
  /**
   * Get all bounced addresses
   */
  public getBouncedAddresses(): Map<string, { reason: string; timestamp: Date }> {
    return new Map(this.bouncedAddresses);
  }
}

/**
 * Get the email recovery service instance
 */
export function getEmailRecoveryService(): EmailRecoveryService {
  return EmailRecoveryService.getInstance();
} 