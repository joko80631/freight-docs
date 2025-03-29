import { beforeAll, afterAll, vi } from 'vitest';
import dotenv from 'dotenv';
import { supabase } from '../src/index.js';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock Supabase client
vi.mock('../src/index.js', () => ({
  supabase: {
    from: vi.fn(),
    storage: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

// Mock OpenAI service
vi.mock('../src/services/openaiService.js', () => ({
  classifyDocument: vi.fn().mockResolvedValue('bill_of_lading')
}));

// Global test setup
beforeAll(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

// Global test cleanup
afterAll(() => {
  // Clean up any resources if needed
}); 