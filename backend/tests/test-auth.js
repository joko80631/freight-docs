import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test configuration
const TEST_USER = {
  email: `test.user.${Date.now()}@freighttracker.com`,
  password: 'TestPassword123!',
  companyName: 'Test Company',
  userName: 'Test User'
};

// Helper function for console output
const log = {
  step: (msg) => console.log('\n📋', msg),
  success: (msg) => console.log('✅', msg),
  error: (msg, error) => console.error('❌', msg, '\n   Error:', error?.message || error),
  info: (msg) => console.log('ℹ️ ', msg)
};

async function testAuthFlow() {
  try {
    // Test 1: Sign up a new user
    log.step('Testing signup functionality...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
        data: {
          company_name: TEST_USER.companyName,
          user_name: TEST_USER.userName
        }
      }
    });

    if (signupError) throw signupError;
    log.success('Signup successful');
    log.info(`Test user created: ${TEST_USER.email}`);

    // Test 2: Try to sign up with same email (should fail)
    log.step('Testing duplicate signup prevention...');
    const { error: duplicateError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (!duplicateError) {
      throw new Error('Duplicate signup should have failed');
    }
    log.success('Duplicate signup prevented');

    // Test 3: Try to login with invalid credentials
    log.step('Testing invalid login...');
    const { error: invalidLoginError } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: 'WrongPassword123!'
    });

    if (!invalidLoginError) {
      throw new Error('Invalid login should have failed');
    }
    log.success('Invalid login prevented');

    // Test 4: Login with correct credentials
    log.step('Testing valid login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (loginError) throw loginError;
    log.success('Login successful');
    log.info(`User ID: ${loginData.user.id}`);

    // Test 5: Verify session persistence
    log.step('Testing session persistence...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    if (!session) throw new Error('Session not found');
    log.success('Session verified');

    // Test 6: Try to access protected route
    log.step('Testing protected route access...');
    const { data: protectedData, error: protectedError } = await supabase
      .from('loads')
      .select('*')
      .limit(1);

    if (protectedError) throw protectedError;
    log.success('Protected route access successful');

    // Test 7: Sign out
    log.step('Testing sign out...');
    const { error: signoutError } = await supabase.auth.signOut();
    
    if (signoutError) throw signoutError;
    log.success('Sign out successful');

    // Test 8: Verify session is cleared
    log.step('Verifying session is cleared...');
    const { data: { session: clearedSession }, error: clearedSessionError } = await supabase.auth.getSession();
    
    if (clearedSessionError) throw clearedSessionError;
    if (clearedSession) throw new Error('Session should be cleared');
    log.success('Session cleared successfully');

    // Test 9: Try to access protected route after sign out
    log.step('Testing protected route access after sign out...');
    const { error: unauthorizedError } = await supabase
      .from('loads')
      .select('*')
      .limit(1);

    if (!unauthorizedError) {
      throw new Error('Unauthorized access should have failed');
    }
    log.success('Unauthorized access prevented');

    log.success('All authentication tests completed successfully! 🎉');

  } catch (error) {
    log.error('Test failed', error);
    process.exit(1);
  }
}

// Run the tests
log.step('Starting Authentication Tests...');
testAuthFlow(); 