import { randomBytes, createHash } from 'crypto';

/**
 * Generate a secure invite token
 * @param teamId The ID of the team
 * @param email The email address of the invitee
 * @param expiresInHours Number of hours until the token expires (default: 72)
 * @returns A secure invite token
 */
export function generateInviteToken(
  teamId: string,
  email: string,
  expiresInHours: number = 72
): string {
  // Generate a random component
  const randomComponent = randomBytes(16).toString('hex');
  
  // Calculate expiration timestamp
  const expirationTime = Date.now() + (expiresInHours * 60 * 60 * 1000);
  
  // Create a data string with all components
  const dataString = `${teamId}:${email}:${expirationTime}:${randomComponent}`;
  
  // Create a hash of the data string
  const hash = createHash('sha256')
    .update(dataString)
    .digest('hex');
  
  // Combine the components into a token
  // Format: base64(teamId:email:expirationTime:randomComponent:hash)
  const tokenData = `${teamId}:${email}:${expirationTime}:${randomComponent}:${hash}`;
  return Buffer.from(tokenData).toString('base64url');
}

/**
 * Validate an invite token
 * @param token The invite token to validate
 * @returns An object with validation result and token data if valid
 */
export function validateInviteToken(token: string): {
  valid: boolean;
  teamId?: string;
  email?: string;
  expired?: boolean;
  error?: string;
} {
  try {
    // Decode the token
    const tokenData = Buffer.from(token, 'base64url').toString('utf-8');
    const [teamId, email, expirationTimeStr, randomComponent, hash] = tokenData.split(':');
    
    // Check if all components are present
    if (!teamId || !email || !expirationTimeStr || !randomComponent || !hash) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    // Check if the token has expired
    const expirationTime = parseInt(expirationTimeStr, 10);
    const now = Date.now();
    if (now > expirationTime) {
      return { valid: false, expired: true, error: 'Token has expired' };
    }
    
    // Verify the hash
    const dataString = `${teamId}:${email}:${expirationTimeStr}:${randomComponent}`;
    const expectedHash = createHash('sha256')
      .update(dataString)
      .digest('hex');
    
    if (hash !== expectedHash) {
      return { valid: false, error: 'Token signature is invalid' };
    }
    
    // Token is valid
    return { valid: true, teamId, email };
  } catch (error) {
    return { valid: false, error: 'Failed to validate token' };
  }
} 