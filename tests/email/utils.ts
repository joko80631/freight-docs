import { EmailOptions } from '@/lib/email/types';

/**
 * Assert that an email contains specific text
 * @param email The email to check
 * @param text The text to look for
 * @param options Additional options for the assertion
 */
export function assertEmailContains(
  email: { options: EmailOptions },
  text: string,
  options: { caseSensitive?: boolean } = {}
): void {
  const { caseSensitive = false } = options;
  const content = email.options.content;
  
  if (!content) {
    throw new Error('Email content is empty');
  }
  
  const contains = caseSensitive
    ? content.includes(text)
    : content.toLowerCase().includes(text.toLowerCase());
    
  if (!contains) {
    throw new Error(`Email does not contain text: "${text}"`);
  }
}

/**
 * Assert that an email matches a regular expression
 * @param email The email to check
 * @param regex The regular expression to match
 */
export function assertEmailMatches(
  email: { options: EmailOptions },
  regex: RegExp
): void {
  const content = email.options.content;
  
  if (!content) {
    throw new Error('Email content is empty');
  }
  
  if (!regex.test(content)) {
    throw new Error(`Email does not match regex: ${regex}`);
  }
}

/**
 * Assert that an email has a specific subject
 * @param email The email to check
 * @param subject The expected subject
 * @param options Additional options for the assertion
 */
export function assertEmailSubject(
  email: { options: EmailOptions },
  subject: string,
  options: { exact?: boolean; caseSensitive?: boolean } = {}
): void {
  const { exact = false, caseSensitive = false } = options;
  const emailSubject = email.options.subject;
  
  if (!emailSubject) {
    throw new Error('Email subject is empty');
  }
  
  let matches = false;
  
  if (exact) {
    matches = caseSensitive
      ? emailSubject === subject
      : emailSubject.toLowerCase() === subject.toLowerCase();
  } else {
    matches = caseSensitive
      ? emailSubject.includes(subject)
      : emailSubject.toLowerCase().includes(subject.toLowerCase());
  }
  
  if (!matches) {
    throw new Error(`Email subject does not match: "${subject}"`);
  }
}

/**
 * Assert that an email has a specific recipient
 * @param email The email to check
 * @param recipient The expected recipient
 */
export function assertEmailRecipient(
  email: { options: EmailOptions },
  recipient: string
): void {
  const to = email.options.to;
  
  if (!to) {
    throw new Error('Email recipient is empty');
  }
  
  let matches = false;
  
  if (typeof to === 'string') {
    matches = to === recipient;
  } else if (Array.isArray(to)) {
    matches = to.some(r => 
      typeof r === 'string' ? r === recipient : r.email === recipient
    );
  } else {
    matches = to.email === recipient;
  }
  
  if (!matches) {
    throw new Error(`Email recipient does not match: "${recipient}"`);
  }
}

/**
 * Assert that an email has an unsubscribe link
 * @param email The email to check
 */
export function assertHasUnsubscribeLink(
  email: { options: EmailOptions }
): void {
  const content = email.options.content;
  
  if (!content) {
    throw new Error('Email content is empty');
  }
  
  // Check for common unsubscribe link patterns
  const hasUnsubscribeLink = 
    content.includes('unsubscribe') || 
    content.includes('opt-out') || 
    content.includes('preferences') ||
    /href=["']([^"']*unsubscribe[^"']*)["']/.test(content);
    
  if (!hasUnsubscribeLink) {
    throw new Error('Email does not contain an unsubscribe link');
  }
}

/**
 * Assert that an email has a specific attachment
 * @param email The email to check
 * @param filename The expected attachment filename
 */
export function assertHasAttachment(
  email: { options: EmailOptions },
  filename: string
): void {
  const attachments = email.options.attachments;
  
  if (!attachments || attachments.length === 0) {
    throw new Error('Email has no attachments');
  }
  
  const hasAttachment = attachments.some(
    attachment => attachment.filename === filename
  );
  
  if (!hasAttachment) {
    throw new Error(`Email does not have attachment: "${filename}"`);
  }
} 