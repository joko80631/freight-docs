import { createEmailProvider } from '@/lib/email/providers/factory';
import { MockProvider } from '@/lib/email/providers/mock';
import { ResendProvider } from '@/lib/email/providers/resend';
import { EmailOptions, SendResult } from '@/lib/email/types';

describe('Email Provider Factory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return MockProvider in test environment', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
    const provider = createEmailProvider();
    expect(provider).toBeInstanceOf(MockProvider);
  });

  it('should return MockProvider in development when EMAIL_PROVIDER is mock', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
    Object.defineProperty(process.env, 'EMAIL_PROVIDER', { value: 'mock' });
    const provider = createEmailProvider();
    expect(provider).toBeInstanceOf(MockProvider);
  });

  it('should return ResendProvider in development when EMAIL_PROVIDER is resend and API key is provided', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
    Object.defineProperty(process.env, 'EMAIL_PROVIDER', { value: 'resend' });
    Object.defineProperty(process.env, 'RESEND_API_KEY', { value: 'test-api-key' });
    const provider = createEmailProvider();
    expect(provider).toBeInstanceOf(ResendProvider);
  });

  it('should throw error in development when EMAIL_PROVIDER is resend but no API key is provided', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
    Object.defineProperty(process.env, 'EMAIL_PROVIDER', { value: 'resend' });
    Object.defineProperty(process.env, 'RESEND_API_KEY', { value: undefined });
    expect(() => createEmailProvider()).toThrow('RESEND_API_KEY is required for ResendProvider');
  });

  it('should throw error for unsupported provider in development', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
    Object.defineProperty(process.env, 'EMAIL_PROVIDER', { value: 'unsupported' });
    expect(() => createEmailProvider()).toThrow('Unsupported email provider: unsupported');
  });

  it('should return ResendProvider in production when API key is provided', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
    Object.defineProperty(process.env, 'RESEND_API_KEY', { value: 'test-api-key' });
    const provider = createEmailProvider();
    expect(provider).toBeInstanceOf(ResendProvider);
  });

  it('should throw error in production when no API key is provided', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
    Object.defineProperty(process.env, 'RESEND_API_KEY', { value: undefined });
    expect(() => createEmailProvider()).toThrow('RESEND_API_KEY is required for ResendProvider');
  });
}); 