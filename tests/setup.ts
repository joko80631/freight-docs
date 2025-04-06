import { MockEmailProvider } from '@/lib/email/providers/mock';
import { ResendProvider } from '@/lib/email/providers/resend';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.EMAIL_PROVIDER = 'mock';
process.env.RESEND_API_KEY = 'test_key';
process.env.EMAIL_SANDBOX_OVERRIDE = 'test@example.com';
process.env.NEXT_PUBLIC_ENABLE_EMAIL_PREVIEW = 'true';
process.env.UNSUBSCRIBE_TOKEN_SECRET = 'test_unsubscribe_secret';
process.env.UNSUBSCRIBE_TOKEN_EXPIRY = '7d';

// Create a global mock email provider for tests
const mockProvider = new MockEmailProvider();

// Mock the email provider factory
jest.mock('@/lib/email/providers/factory', () => ({
  getEmailProvider: () => mockProvider,
}));

// Export the mock provider for use in tests
export { mockProvider };

// Global before/after hooks
beforeAll(() => {
  // Set up any global test configuration
  console.log('Setting up test environment...');
});

afterAll(() => {
  // Clean up any global test resources
  console.log('Cleaning up test environment...');
});

// Reset the mock provider between tests
beforeEach(() => {
  mockProvider.clearSentEmails();
}); 