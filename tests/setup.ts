import '@testing-library/jest-dom';
import { MockProvider } from '@/lib/email/providers/mock';
import { ResendProvider } from '@/lib/email/providers/resend';

// Mock environment variables for testing
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
process.env.EMAIL_PROVIDER = 'mock';
process.env.RESEND_API_KEY = 'test_key';
process.env.EMAIL_SANDBOX_OVERRIDE = 'test@example.com';
process.env.NEXT_PUBLIC_ENABLE_EMAIL_PREVIEW = 'true';
process.env.UNSUBSCRIBE_TOKEN_SECRET = 'test_unsubscribe_secret';
process.env.UNSUBSCRIBE_TOKEN_EXPIRY = '7d';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test_anon_key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

// Create a global mock email provider for tests
const mockProvider = new MockProvider();

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