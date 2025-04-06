import { createHmac, randomBytes } from 'crypto';

/**
 * Generate an unsubscribe token for a user
 * @param email The email address to unsubscribe
 * @param scope The scope of the unsubscribe (e.g., 'all', 'team-invites', 'document-reminders')
 * @param expiresInDays Number of days until the token expires (default: 365)
 * @returns A secure unsubscribe token
 */
export function generateUnsubscribeToken(
  email: string,
  scope: string,
  expiresInDays: number = 365
): string {
  // Get the server secret from environment variables
  const serverSecret = process.env.EMAIL_SECRET_KEY;
  if (!serverSecret) {
    throw new Error('EMAIL_SECRET_KEY environment variable is not set');
  }

  // Generate a random component for uniqueness
  const randomComponent = randomBytes(8).toString('hex');
  
  // Calculate expiration timestamp
  const expirationTime = Date.now() + (expiresInDays * 24 * 60 * 60 * 1000);
  
  // Create a data string with all components
  const dataString = `${email}:${scope}:${expirationTime}:${randomComponent}`;
  
  // Create an HMAC of the data string
  const hmac = createHmac('sha256', serverSecret)
    .update(dataString)
    .digest('hex');
  
  // Combine the components into a token
  // Format: base64(email:scope:expirationTime:randomComponent:hmac)
  const tokenData = `${email}:${scope}:${expirationTime}:${randomComponent}:${hmac}`;
  return Buffer.from(tokenData).toString('base64url');
}

/**
 * Validate an unsubscribe token
 * @param token The unsubscribe token to validate
 * @returns An object with validation result and token data if valid
 */
export function validateUnsubscribeToken(token: string): {
  valid: boolean;
  email?: string;
  scope?: string;
  expired?: boolean;
  error?: string;
} {
  try {
    // Get the server secret from environment variables
    const serverSecret = process.env.EMAIL_SECRET_KEY;
    if (!serverSecret) {
      return { valid: false, error: 'Server configuration error' };
    }

    // Decode the token
    const tokenData = Buffer.from(token, 'base64url').toString('utf-8');
    const [email, scope, expirationTimeStr, randomComponent, hmac] = tokenData.split(':');
    
    // Check if all components are present
    if (!email || !scope || !expirationTimeStr || !randomComponent || !hmac) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    // Check if the token has expired
    const expirationTime = parseInt(expirationTimeStr, 10);
    const now = Date.now();
    if (now > expirationTime) {
      return { valid: false, expired: true, error: 'Token has expired' };
    }
    
    // Verify the HMAC
    const dataString = `${email}:${scope}:${expirationTimeStr}:${randomComponent}`;
    const expectedHmac = createHmac('sha256', serverSecret)
      .update(dataString)
      .digest('hex');
    
    if (hmac !== expectedHmac) {
      return { valid: false, error: 'Token signature is invalid' };
    }
    
    // Token is valid
    return { valid: true, email, scope };
  } catch (error) {
    return { valid: false, error: 'Failed to validate token' };
  }
} 