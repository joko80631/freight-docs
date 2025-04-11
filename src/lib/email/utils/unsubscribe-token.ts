import { createHash } from 'crypto';

export interface UnsubscribeResult {
  success: boolean;
  message: string;
}

export class UnsubscribeToken {
  private readonly SECRET = process.env.EMAIL_UNSUBSCRIBE_SECRET || 'default-secret';
  private readonly BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  private generateToken(email: string): string {
    const timestamp = Date.now();
    const data = `${email}:${timestamp}:${this.SECRET}`;
    return createHash('sha256').update(data).digest('hex');
  }

  async generateUrl(email: string): Promise<string> {
    const token = this.generateToken(email);
    const encodedEmail = encodeURIComponent(email);
    return `${this.BASE_URL}/unsubscribed?email=${encodedEmail}&token=${token}`;
  }

  async verifyToken(email: string, token: string): Promise<boolean> {
    const expectedToken = this.generateToken(email);
    return token === expectedToken;
  }
}

// Create and export the singleton instance
const unsubscribeTokenService = new UnsubscribeToken();

export async function unsubscribeUser(email: string, token: string): Promise<UnsubscribeResult> {
  try {
    const isValid = await unsubscribeTokenService.verifyToken(email, token);
    if (!isValid) {
      return {
        success: false,
        message: 'Invalid unsubscribe token'
      };
    }

    // TODO: Implement actual unsubscribe logic here
    // For now, just return success
    return {
      success: true,
      message: 'Successfully unsubscribed'
    };
  } catch (error) {
    console.error('Error unsubscribing user:', error);
    return {
      success: false,
      message: 'An error occurred while unsubscribing'
    };
  }
} 