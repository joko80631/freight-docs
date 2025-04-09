import { EmailProvider } from './types';
import { ResendProvider } from './resend';

export function createEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER || 'resend';

  switch (provider.toLowerCase()) {
    case 'resend':
      return new ResendProvider();
    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
} 