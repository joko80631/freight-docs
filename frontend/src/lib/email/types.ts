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
  type: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  unsubscribeUrl?: string;
  version: string;
  metadata?: Record<string, unknown>;
}

export enum TEMPLATE_VERSIONS {
  'document-upload' = 'v1',
  'load-status' = 'v1',
  'team-invite' = 'v1',
  'team-role-update' = 'v1',
  'missing-document' = 'v1',
  'document-uploaded' = 'v1',
  'classification-result' = 'v1',
  'load-status-update' = 'v1',
}

export interface RenderedEmailTemplate {
  subject: string;
  html: string;
  text?: string;
  version: string;
  metadata?: Record<string, unknown>;
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
}

export type NotificationCategory = 
  | 'account'
  | 'documents'
  | 'team'
  | 'loads'
  | 'system'
  | 'marketing';

export type NotificationType =
  | 'account_updates'
  | 'password_changes'
  | 'security_alerts'
  | 'document_uploads'
  | 'document_updates'
  | 'document_deletions'
  | 'document_classifications'
  | 'missing_documents'
  | 'team_invites'
  | 'team_role_changes'
  | 'team_member_changes'
  | 'load_created'
  | 'load_updated'
  | 'load_status_changed'
  | 'load_completed'
  | 'system_maintenance'
  | 'system_updates'
  | 'marketing_newsletter'
  | 'marketing_promotions';

export type NotificationFrequency = 'immediate' | 'daily' | 'weekly' | 'never';

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