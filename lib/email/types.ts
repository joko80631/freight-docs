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
} 