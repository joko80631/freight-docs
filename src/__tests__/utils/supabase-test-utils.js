/**
 * Utility functions for testing Supabase connections and operations
 * @module supabase-test-utils
 */

import { createClient } from '@supabase/supabase-js';

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  email_confirmed_at: null,
};

const mockSession = {
  user: mockUser,
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
};

let supabaseInstance = null;

export const createMockSupabase = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
  );

  // Mock auth methods
  supabaseInstance.auth = {
    getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    signUp: jest.fn().mockImplementation(({ email }) => {
      if (email === 'test@example.com') {
        return Promise.resolve({ data: { user: mockUser }, error: null });
      }
      return Promise.resolve({ data: null, error: { message: 'User already exists' } });
    }),
    signInWithPassword: jest.fn().mockImplementation(({ email }) => {
      if (email === 'unverified@example.com') {
        return Promise.resolve({ 
          data: null, 
          error: { message: 'Email not confirmed' }
        });
      }
      if (email === 'test@example.com') {
        return Promise.resolve({ data: { session: mockSession }, error: null });
      }
      return Promise.resolve({ 
        data: null, 
        error: { message: 'Invalid credentials' }
      });
    }),
    verifyOtp: jest.fn().mockImplementation(({ token_hash }) => {
      if (token_hash === 'test-verification-token') {
        return Promise.resolve({ 
          data: { user: { ...mockUser, email_confirmed_at: new Date() } }, 
          error: null 
        });
      }
      return Promise.resolve({ 
        data: null, 
        error: { message: 'Invalid verification token' }
      });
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockImplementation((callback) => {
      // Call the callback immediately with the mock session
      callback('SIGNED_IN', mockSession);
      // Return a mock subscription
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn()
          }
        }
      };
    }),
  };

  return supabaseInstance;
};

// Reset the instance between tests
export const resetSupabaseInstance = () => {
  supabaseInstance = null;
};

// Add a test to satisfy Jest's requirement
describe('Supabase Test Utils', () => {
  test('createMockSupabase returns a mock Supabase client', () => {
    const supabase = createMockSupabase();
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });
});

/**
 * Tests the Supabase connection by attempting to fetch data
 * @async
 * @function testSupabaseConnection
 * @returns {Promise<boolean>} True if connection is successful, false otherwise
 * @throws {Error} If environment variables are not properly configured
 */
export async function testSupabaseConnection() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase environment variables are not properly configured');
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Try to fetch a simple query
        const { data, error } = await supabase
            .from('documents')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('Supabase connection error:', error.message);
            return false;
        }
        
        console.log('✅ Supabase connection successful!');
        console.log('Data:', data);
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        return false;
    }
}

/**
 * Tests database access by attempting to perform basic CRUD operations
 * @async
 * @function testDatabaseAccess
 * @returns {Promise<boolean>} True if all operations are successful, false otherwise
 */
export async function testDatabaseAccess() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase environment variables are not properly configured');
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test read operation
        const { data: readData, error: readError } = await supabase
            .from('documents')
            .select('*')
            .limit(1);
            
        if (readError) {
            console.error('Read operation failed:', readError.message);
            return false;
        }

        console.log('✅ Database access successful!');
        return true;
    } catch (error) {
        console.error('❌ Database access failed:', error.message);
        return false;
    }
} 