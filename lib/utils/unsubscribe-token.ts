import { createHash } from 'crypto';

/**
 * Generate a token for unsubscribe links
 * @param email The email address to generate a token for
 * @param scope The scope of the unsubscribe (e.g., 'all', 'reminders', etc.)
 * @returns A signed token that can be used in unsubscribe links
 */
export function generateUnsubscribeToken(email: string, scope: string = 'all'): string {
  const timestamp = Date.now();
  const data = `${email}:${scope}:${timestamp}:${process.env.UNSUBSCRIBE_SECRET}`;
  const hash = createHash('sha256').update(data).digest('hex');
  const token = Buffer.from(`${email}:${scope}:${timestamp}:${hash}`).toString('base64');
  return encodeURIComponent(token);
}

/**
 * Verify an unsubscribe token
 * @param token The token to verify
 * @returns The email and scope if valid, null if invalid
 */
export function verifyUnsubscribeToken(token: string): { email: string; scope: string } | null {
  try {
    const decoded = Buffer.from(decodeURIComponent(token), 'base64').toString();
    const [email, scope, timestamp, hash] = decoded.split(':');

    // Verify timestamp (token valid for 30 days)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }

    // Verify hash
    const data = `${email}:${scope}:${timestamp}:${process.env.UNSUBSCRIBE_SECRET}`;
    const expectedHash = createHash('sha256').update(data).digest('hex');
    if (hash !== expectedHash) {
      return null;
    }

    return { email, scope };
  } catch (error) {
    return null;
  }
} 