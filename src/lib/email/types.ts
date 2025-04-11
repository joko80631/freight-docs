/**
 * Core email types
 */
export interface EmailRecipient {
  name?: string;
  email: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  description: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
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
 * Email preferences and notification types
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
}

/**
 * Notification categories and types
 */
export type NotificationCategory = 
  | 'account'    // Account-related notifications
  | 'documents'  // Document-related notifications
  | 'team'       // Team-related notifications
  | 'loads'      // Load-related notifications
  | 'system'     // System notifications
  | 'marketing'; // Marketing communications

export type NotificationType =
  // Account notifications
  | 'account_updates'
  | 'password_changes'
  | 'security_alerts'
  
  // Document notifications
  | 'document_uploads'
  | 'document_updates'
  | 'document_deletions'
  | 'document_classifications'
  | 'missing_documents'
  
  // Team notifications
  | 'team_invites'
  | 'team_role_changes'
  | 'team_member_changes'
  
  // Load notifications
  | 'load_created'
  | 'load_updated'
  | 'load_status_changed'
  | 'load_completed'
  
  // System notifications
  | 'system_maintenance'
  | 'system_updates'
  
  // Marketing notifications
  | 'marketing_newsletter'
  | 'marketing_promotions';

export type NotificationFrequency = 'immediate' | 'daily' | 'weekly' | 'never';

/**
 * Notification preferences and digests
 */
export interface NotificationPreference {
  id: string;
  userId: string;
  category: NotificationCategory;
  type: NotificationType;
  enabled: boolean;
  frequency: NotificationFrequency;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDigest {
  id: string;
  userId: string;
  category: NotificationCategory;
  frequency: NotificationFrequency;
  lastSentAt: string | null;
  nextScheduledAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingNotification {
  id: string;
  userId: string;
  category: NotificationCategory;
  type: NotificationType;
  data: Record<string, any>;
  createdAt: string;
  processedAt: string | null;
  sentAt: string | null;
  error: Record<string, any> | null;
}

type CategoryPreferences = {
  enabled: boolean;
  frequency: NotificationFrequency;
  types: Partial<Record<NotificationType, {
    enabled: boolean;
    frequency: NotificationFrequency;
  }>>;
};

export interface NotificationPreferences {
  global: {
    enabled: boolean;
    frequency: NotificationFrequency;
  };
  categories: Record<NotificationCategory, CategoryPreferences>;
}

export interface NotificationDigestPreferences {
  categories: Partial<Record<NotificationCategory, NotificationFrequency>>;
} 