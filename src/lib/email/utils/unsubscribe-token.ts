import { createHash } from 'crypto';

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