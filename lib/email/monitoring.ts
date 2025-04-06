/**
 * Email monitoring and logging system
 */

import { EmailOptions } from './types';
import { EmailError } from './errors';

/**
 * Email event types
 */
export enum EmailEventType {
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  OPENED = 'opened',
  CLICKED = 'clicked',
  UNSUBSCRIBED = 'unsubscribed',
  RETRIED = 'retried',
  PREVIEWED = 'previewed',
}

/**
 * Email event data
 */
export interface EmailEvent {
  id: string;
  type: EmailEventType;
  timestamp: Date;
  emailId?: string;
  templateName?: string;
  recipient?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: Record<string, any>;
}

/**
 * Email monitoring service
 */
export class EmailMonitoringService {
  private static instance: EmailMonitoringService;
  private events: EmailEvent[] = [];
  private maxEvents: number = 1000; // Keep last 1000 events in memory
  private alertThreshold: number = 5; // Alert after 5 failures in 5 minutes
  private failureWindow: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  private alertCallbacks: ((event: EmailEvent) => void)[] = [];

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): EmailMonitoringService {
    if (!EmailMonitoringService.instance) {
      EmailMonitoringService.instance = new EmailMonitoringService();
    }
    return EmailMonitoringService.instance;
  }

  /**
   * Log an email event
   */
  public logEvent(event: Omit<EmailEvent, 'id' | 'timestamp'>): EmailEvent {
    const fullEvent: EmailEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    // Add to events array
    this.events.push(fullEvent);

    // Trim events if needed
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Check for failure alerts
    if (event.type === EmailEventType.FAILED) {
      this.checkFailureAlerts();
    }

    // Persist to database or external service in a real implementation
    this.persistEvent(fullEvent);

    return fullEvent;
  }

  /**
   * Log a sent email
   */
  public logSentEmail(emailId: string, options: EmailOptions, templateName?: string): EmailEvent {
    return this.logEvent({
      type: EmailEventType.SENT,
      emailId,
      templateName,
      recipient: typeof options.to === 'string' ? options.to : options.to.email,
      metadata: {
        subject: options.subject,
        hasAttachments: options.attachments && options.attachments.length > 0,
      },
    });
  }

  /**
   * Log a failed email
   */
  public logFailedEmail(error: Error, options: EmailOptions, templateName?: string): EmailEvent {
    const errorData = error instanceof EmailError
      ? {
          code: error.code,
          message: error.message,
          details: error.details,
        }
      : {
          code: 'UNKNOWN_ERROR',
          message: error.message,
        };

    return this.logEvent({
      type: EmailEventType.FAILED,
      templateName,
      recipient: typeof options.to === 'string' ? options.to : options.to.email,
      error: errorData,
      metadata: {
        subject: options.subject,
        hasAttachments: options.attachments && options.attachments.length > 0,
      },
    });
  }

  /**
   * Log a bounced email
   */
  public logBouncedEmail(emailId: string, recipient: string, reason: string): EmailEvent {
    return this.logEvent({
      type: EmailEventType.BOUNCED,
      emailId,
      recipient,
      error: {
        code: 'BOUNCE',
        message: reason,
      },
    });
  }

  /**
   * Log an email retry
   */
  public logRetriedEmail(originalEmailId: string, newEmailId: string, options: EmailOptions): EmailEvent {
    return this.logEvent({
      type: EmailEventType.RETRIED,
      emailId: newEmailId,
      recipient: typeof options.to === 'string' ? options.to : options.to.email,
      metadata: {
        originalEmailId,
        subject: options.subject,
      },
    });
  }

  /**
   * Log an email preview
   */
  public logEmailPreview(templateName: string, recipient: string): EmailEvent {
    return this.logEvent({
      type: EmailEventType.PREVIEWED,
      templateName,
      recipient,
    });
  }

  /**
   * Get recent events
   */
  public getRecentEvents(limit: number = 100): EmailEvent[] {
    return [...this.events].reverse().slice(0, limit);
  }

  /**
   * Get events by type
   */
  public getEventsByType(type: EmailEventType, limit: number = 100): EmailEvent[] {
    return this.events
      .filter(event => event.type === type)
      .reverse()
      .slice(0, limit);
  }

  /**
   * Get failed events
   */
  public getFailedEvents(limit: number = 100): EmailEvent[] {
    return this.getEventsByType(EmailEventType.FAILED, limit);
  }

  /**
   * Register an alert callback
   */
  public onAlert(callback: (event: EmailEvent) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Check for failure alerts
   */
  private checkFailureAlerts(): void {
    const now = new Date();
    const recentFailures = this.events.filter(
      event => 
        event.type === EmailEventType.FAILED && 
        now.getTime() - event.timestamp.getTime() < this.failureWindow
    );

    if (recentFailures.length >= this.alertThreshold) {
      // Trigger alert callbacks
      const latestFailure = recentFailures[recentFailures.length - 1];
      this.alertCallbacks.forEach(callback => callback(latestFailure));
    }
  }

  /**
   * Persist event to database or external service
   * In a real implementation, this would save to a database or send to a monitoring service
   */
  private persistEvent(event: EmailEvent): void {
    // In a real implementation, this would save to a database or send to a monitoring service
    // For now, we'll just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Email event:', event);
    }
  }
}

/**
 * Get the email monitoring service instance
 */
export function getEmailMonitoringService(): EmailMonitoringService {
  return EmailMonitoringService.getInstance();
} 