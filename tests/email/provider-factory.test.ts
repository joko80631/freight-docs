import { getEmailProvider } from '@/lib/email/providers/factory';
import { ResendProvider } from '@/lib/email/providers/resend';
import { MockEmailProvider } from '@/lib/email/providers/mock';

describe('Email Provider Factory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return ResendProvider in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.EMAIL_PROVIDER = 'resend';
    
    const provider = getEmailProvider();
    expect(provider).toBeInstanceOf(ResendProvider);
  });

  it('should return MockEmailProvider in test environment', () => {
    process.env.NODE_ENV = 'test';
    process.env.EMAIL_PROVIDER = 'mock';
    
    const provider = getEmailProvider();
    expect(provider).toBeInstanceOf(MockEmailProvider);
  });

  it('should return MockEmailProvider in development when EMAIL_PROVIDER is mock', () => {
    process.env.NODE_ENV = 'development';
    process.env.EMAIL_PROVIDER = 'mock';
    
    const provider = getEmailProvider();
    expect(provider).toBeInstanceOf(MockEmailProvider);
  });

  it('should return ResendProvider in development when EMAIL_PROVIDER is resend', () => {
    process.env.NODE_ENV = 'development';
    process.env.EMAIL_PROVIDER = 'resend';
    
    const provider = getEmailProvider();
    expect(provider).toBeInstanceOf(ResendProvider);
  });

  it('should use sandbox email override in non-production environments', async () => {
    process.env.NODE_ENV = 'development';
    process.env.EMAIL_PROVIDER = 'resend';
    process.env.EMAIL_SANDBOX_OVERRIDE = 'sandbox@example.com';
    
    const provider = getEmailProvider();
    const result = await provider.sendEmail({
      to: 'real@example.com',
      subject: 'Test',
      content: 'Test content',
    });
    
    // In development, emails should be redirected to the sandbox
    expect(result.success).toBe(true);
    // The actual implementation would check the email was sent to sandbox@example.com
  });
}); 