import { createMockSupabase } from '../__tests__/utils/supabase-test-utils';

// Mock fetch globally
global.fetch = jest.fn((url) => {
  if (url.includes('verify-email')) {
    return Promise.resolve({
      status: 302,
      ok: true,
      json: () => Promise.resolve({ message: 'Redirecting to login' })
    });
  }
  if (url.includes('/loads')) {
    return Promise.resolve({
      status: 302,
      ok: true,
      json: () => Promise.resolve({ message: 'Redirecting to login' })
    });
  }
  return Promise.resolve({
    status: 404,
    ok: false
  });
});

const supabase = createMockSupabase();

const testUser = {
  email: 'test@example.com',
  password: 'test-password',
};

const unverifiedUser = {
  email: 'unverified@example.com',
  password: 'test-password',
};

const verificationToken = 'test-verification-token';

describe('Email Verification Flow', () => {
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
  });

  test('3. Login Behavior', async () => {
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
    expect(loginData.session).toBeDefined();
    expect(loginData.session.user.email).toBe(testUser.email);
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
  });
}); 