import { createEmailProvider } from './providers/factory';
import { EmailProvider } from './providers/types';
import { EmailTemplate } from './templates';
import { EmailPreferences } from './utils/preferences';
import { NotificationWrapper } from './utils/notification-wrapper';
import { EmailDeduplication } from './utils/deduplication';
import { UnsubscribeToken } from './utils/unsubscribe-token';
import { AuditLogger } from './utils/audit-log';
import { EmailError, EmailErrorCode } from './errors';
import { EmailMonitoring } from './monitoring';

export interface EmailOptions {
  provider?: EmailProvider;
  preferences?: EmailPreferences;
  deduplication?: EmailDeduplication;
  unsubscribeToken?: UnsubscribeToken;
  auditLogger?: AuditLogger;
  monitoring?: EmailMonitoring;
}

export class Email {
  private provider: EmailProvider;
  private preferences: EmailPreferences;
  private deduplication: EmailDeduplication;
  private unsubscribeToken: UnsubscribeToken;
  private auditLogger: AuditLogger;
  private monitoring: EmailMonitoring;

  constructor(options: EmailOptions = {}) {
    this.provider = options.provider || createEmailProvider();
    this.preferences = options.preferences || new EmailPreferences();
    this.deduplication = options.deduplication || new EmailDeduplication();
    this.unsubscribeToken = options.unsubscribeToken || new UnsubscribeToken();
    this.auditLogger = options.auditLogger || new AuditLogger();
    this.monitoring = options.monitoring || new EmailMonitoring();
  }

  async send(template: EmailTemplate): Promise<void> {
    try {
      // Check if user has unsubscribed
      const isUnsubscribed = await this.preferences.isUnsubscribed(template.to);
      if (isUnsubscribed) {
        throw new EmailError(EmailErrorCode.UNSUBSCRIBED, `User ${template.to} has unsubscribed`);
      }

      // Check for duplicate emails
      const isDuplicate = await this.deduplication.isDuplicate(template);
      if (isDuplicate) {
        throw new EmailError(EmailErrorCode.DUPLICATE, `Duplicate email detected for ${template.to}`);
      }

      // Add unsubscribe token
      const unsubscribeUrl = await this.unsubscribeToken.generateUrl(template.to);
      template.unsubscribeUrl = unsubscribeUrl;

      // Send email
      await this.provider.send(template);

      // Log audit trail
      await this.auditLogger.log({
        type: 'email_sent',
        data: {
          to: template.to,
          subject: template.subject,
          templateType: template.type,
        },
      });

      // Record metrics
      this.monitoring.recordSuccess(template.type);
    } catch (error) {
      // Record error metrics
      this.monitoring.recordError(template.type, error);

      // Log error
      await this.auditLogger.log({
        type: 'email_error',
        data: {
          to: template.to,
          subject: template.subject,
          templateType: template.type,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }
}

export * from './templates';
export * from './types';
export * from './errors'; 