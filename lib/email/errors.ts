/**
 * Email-specific error types and handling
 */

/**
 * Base class for all email-related errors
 */
export class EmailError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'EmailError';
  }
}

/**
 * Error when email template validation fails
 */
export class EmailTemplateValidationError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, 'TEMPLATE_VALIDATION_ERROR', details);
    this.name = 'EmailTemplateValidationError';
  }
}

/**
 * Error when email template is not found
 */
export class EmailTemplateNotFoundError extends EmailError {
  constructor(templateName: string) {
    super(`Template "${templateName}" not found`, 'TEMPLATE_NOT_FOUND');
    this.name = 'EmailTemplateNotFoundError';
  }
}

/**
 * Error when email provider fails to send
 */
export class EmailSendError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, 'SEND_ERROR', details);
    this.name = 'EmailSendError';
  }
}

/**
 * Error when email recipient is invalid
 */
export class EmailRecipientError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, 'RECIPIENT_ERROR', details);
    this.name = 'EmailRecipientError';
  }
}

/**
 * Error when email attachment is invalid
 */
export class EmailAttachmentError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, 'ATTACHMENT_ERROR', details);
    this.name = 'EmailAttachmentError';
  }
}

/**
 * Error when unsubscribe token is invalid
 */
export class UnsubscribeTokenError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, 'UNSUBSCRIBE_TOKEN_ERROR', details);
    this.name = 'UnsubscribeTokenError';
  }
}

/**
 * Error when email opt-in status check fails
 */
export class EmailOptInError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, 'OPT_IN_ERROR', details);
    this.name = 'EmailOptInError';
  }
}

/**
 * Error when email preview fails
 */
export class EmailPreviewError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, 'PREVIEW_ERROR', details);
    this.name = 'EmailPreviewError';
  }
}

/**
 * Error when email retry fails
 */
export class EmailRetryError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, 'RETRY_ERROR', details);
    this.name = 'EmailRetryError';
  }
}

/**
 * Error when email bounce handling fails
 */
export class EmailBounceError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, 'BOUNCE_ERROR', details);
    this.name = 'EmailBounceError';
  }
}

/**
 * Get a user-friendly error message for display in the UI
 */
export function getUserFriendlyErrorMessage(error: Error): string {
  if (error instanceof EmailError) {
    switch (error.code) {
      case 'TEMPLATE_VALIDATION_ERROR':
        return 'The email template is missing required information.';
      case 'TEMPLATE_NOT_FOUND':
        return 'The requested email template could not be found.';
      case 'SEND_ERROR':
        return 'We were unable to send the email. Please try again later.';
      case 'RECIPIENT_ERROR':
        return 'The email address is invalid or could not be reached.';
      case 'ATTACHMENT_ERROR':
        return 'There was a problem with the email attachment.';
      case 'UNSUBSCRIBE_TOKEN_ERROR':
        return 'The unsubscribe link is invalid or has expired.';
      case 'OPT_IN_ERROR':
        return 'We could not verify your email preferences.';
      case 'PREVIEW_ERROR':
        return 'We could not generate a preview of the email.';
      case 'RETRY_ERROR':
        return 'We were unable to retry sending the email.';
      case 'BOUNCE_ERROR':
        return 'We received a bounce notification for this email.';
      default:
        return 'An unexpected error occurred with the email system.';
    }
  }
  
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof EmailError) {
    // These errors are generally not retryable
    const nonRetryableCodes = [
      'TEMPLATE_VALIDATION_ERROR',
      'TEMPLATE_NOT_FOUND',
      'RECIPIENT_ERROR',
      'ATTACHMENT_ERROR',
      'UNSUBSCRIBE_TOKEN_ERROR',
      'OPT_IN_ERROR',
      'PREVIEW_ERROR',
    ];
    
    return !nonRetryableCodes.includes(error.code);
  }
  
  // For unknown errors, assume they might be retryable
  return true;
} 