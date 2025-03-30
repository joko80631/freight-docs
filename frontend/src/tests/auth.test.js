const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

describe('Email Verification Flow', () => {
  let testUser;
  let verificationToken;

  beforeAll(() => {
    // Generate test user data
    testUser = {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
    };
  });

  afterAll(async () => {
    // Clean up test user
    if (testUser) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.admin.deleteUser(user.id);
      }
    }
  });

  test('1. Signup Process', async () => {
    // Test signup
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`,
      },
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
    expect(data.user.email_confirmed_at).toBeNull(); // Email should not be confirmed yet

    // Note: In a real test environment, you would need to intercept the email
    // or use a test email service to get the verification token
    // For this test, we'll simulate the token
    verificationToken = 'test-verification-token';
  });

  test('2. Verification Page', async () => {
    // Test verification with valid token
    const { data: verificationData, error: verificationError } = await supabase.auth.verifyOtp({
      token_hash: verificationToken,
      type: 'email',
    });

    expect(verificationError).toBeNull();
    expect(verificationData.user).toBeDefined();
    expect(verificationData.user.email_confirmed_at).toBeDefined();

    // Test verification with invalid token
    const { error: invalidTokenError } = await supabase.auth.verifyOtp({
      token_hash: 'invalid-token',
      type: 'email',
    });

    expect(invalidTokenError).toBeDefined();
    expect(invalidTokenError.message).toContain('Invalid token');
  });

  test('3. Login Behavior', async () => {
    // Create a second test user for unverified login test
    const unverifiedUser = {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
    };

    // Sign up second user
    await supabase.auth.signUp({
      email: unverifiedUser.email,
      password: unverifiedUser.password,
    });

    // Test login with unverified account
    const { error: unverifiedLoginError } = await supabase.auth.signInWithPassword({
      email: unverifiedUser.email,
      password: unverifiedUser.password,
    });

    expect(unverifiedLoginError).toBeDefined();
    expect(unverifiedLoginError.message).toContain('Email not confirmed');

    // Test login with verified account
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginError).toBeNull();
    expect(loginData.user).toBeDefined();
    expect(loginData.user.email_confirmed_at).toBeDefined();

    // Clean up second test user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  });

  test('4. Edge Cases', async () => {
    // Test accessing verification page with invalid token
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=invalid-token&type=email_verification`
    );
    expect(response.status).toBe(302); // Should redirect to login

    // Test accessing protected route without session
    const protectedResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/loads`);
    expect(protectedResponse.status).toBe(302); // Should redirect to login

    // Test expired verification link
    // Note: This would require mocking time or using a real expired token
    // For this test, we'll simulate an expired token
    const { error: expiredTokenError } = await supabase.auth.verifyOtp({
      token_hash: 'expired-token',
      type: 'email',
    });

    expect(expiredTokenError).toBeDefined();
    expect(expiredTokenError.message).toContain('Invalid or expired token');
  });
}); 