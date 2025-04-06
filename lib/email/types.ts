export interface EmailRecipient {
  name?: string;
  email: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  cc?: EmailRecipient | EmailRecipient[];
  bcc?: EmailRecipient | EmailRecipient[];
  subject: string;
  content: string;
  attachments?: EmailAttachment[];
  replyTo?: EmailRecipient;
  from?: string;
  userId?: string;
  templateName?: string;
  metadata?: Record<string, any>;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  errors?: Error[];
}

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<SendResult>;
}

/**
 * User email preferences stored in the profiles table
 */
export interface EmailPreferences {
  /**
   * Global opt-in/opt-out for all emails
   */
  global_enabled: boolean;
  
  /**
   * Optional category-specific preferences
   * Example: { "notifications": true, "marketing": false }
   */
  categories?: Record<string, boolean>;
  
  /**
   * Optional frequency preferences
   * Example: { "digest": "daily", "alerts": "immediate" }
   */
  frequency?: Record<string, "immediate" | "daily" | "weekly" | "never">;
  
  /**
   * Email addresses that have bounced
   * Example: { "user@example.com": { bounced: true, lastBounce: "2023-01-01T00:00:00Z", reason: "hard_bounce" } }
   */
  bounced_addresses?: Record<string, {
    bounced: boolean;
    lastBounce: string;
    reason: string;
  }>;
  
  /**
   * Source of the preference update
   * Example: "manual", "unsubscribe-link", "bounce-handler"
   */
  source?: string;
  
  /**
   * Last time preferences were updated
   */
  updated_at?: string;
}

/**
 * Notification type configuration
 * Maps notification types to roles that should receive them
 */
export interface NotificationConfig {
  [notificationType: string]: string[];
}

/**
 * Default notification configuration
 */
export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  missing_documents: ['admin', 'doc_manager'],
  classification_results: ['admin'],
  load_status_updates: ['admin', 'load_manager'],
  team_invites: ['admin'],
  document_uploads: ['admin', 'doc_manager'],
  team_role_updates: ['admin'],
}; 