import { EmailProvider } from '../types';
import { ResendProvider } from './resend';
import { MockProvider } from './mock';

let mockProviderInstance: MockProvider | null = null;
let resendProviderInstance: ResendProvider | null = null;

export function createEmailProvider(): EmailProvider {
  const isTest = process.env.NODE_ENV === 'test';
  const isDev = process.env.NODE_ENV === 'development';
  const provider = process.env.EMAIL_PROVIDER || 'resend';
  const apiKey = process.env.RESEND_API_KEY;

  // Always use mock provider in test environment
  if (isTest) {
    if (!mockProviderInstance) {
      mockProviderInstance = new MockProvider();
    }
    return mockProviderInstance;
  }

  // Use specified provider in development
  if (isDev) {
    switch (provider.toLowerCase()) {
      case 'mock':
        if (!mockProviderInstance) {
          mockProviderInstance = new MockProvider();
        }
        return mockProviderInstance;
      case 'resend':
        if (!resendProviderInstance) {
          if (!apiKey) {
            throw new Error('RESEND_API_KEY is required for ResendProvider');
          }
          resendProviderInstance = new ResendProvider(apiKey);
        }
        return resendProviderInstance;
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }
  }

  // Use Resend in production
  if (!resendProviderInstance) {
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required for ResendProvider');
    }
    resendProviderInstance = new ResendProvider(apiKey);
  }
  return resendProviderInstance;
} 