import { generateUnsubscribeToken, verifyUnsubscribeToken } from '@/lib/utils/unsubscribe-token';
import { hasEmailOptIn, updateEmailOptIn } from '@/lib/email/utils';

describe('Email Unsubscribe Flow', () => {
  const testEmail = 'test@example.com';
  const testScope = 'notifications';

  describe('Token Generation and Verification', () => {
    it('should generate valid unsubscribe token', () => {
      const token = generateUnsubscribeToken(testEmail, testScope);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should verify valid unsubscribe token', () => {
      const token = generateUnsubscribeToken(testEmail, testScope);
      const verified = verifyUnsubscribeToken(token);
      expect(verified).toBeDefined();
      expect(verified.email).toBe(testEmail);
      expect(verified.scope).toBe(testScope);
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid-token';
      expect(() => verifyUnsubscribeToken(invalidToken)).toThrow();
    });

    it('should reject expired token', () => {
      // Create a token that's already expired
      const token = generateUnsubscribeToken(testEmail, testScope, 0);
      expect(() => verifyUnsubscribeToken(token)).toThrow('Token expired');
    });
  });

  describe('Email Opt-in Management', () => {
    beforeEach(async () => {
      // Reset opt-in status before each test
      await updateEmailOptIn(testEmail, testScope, true);
    });

    it('should check email opt-in status', async () => {
      const hasOptIn = await hasEmailOptIn(testEmail, testScope);
      expect(hasOptIn).toBe(true);
    });

    it('should update email opt-in status', async () => {
      await updateEmailOptIn(testEmail, testScope, false);
      const hasOptIn = await hasEmailOptIn(testEmail, testScope);
      expect(hasOptIn).toBe(false);
    });

    it('should handle multiple scopes', async () => {
      const scope1 = 'notifications';
      const scope2 = 'marketing';

      // Set different opt-in statuses for different scopes
      await updateEmailOptIn(testEmail, scope1, true);
      await updateEmailOptIn(testEmail, scope2, false);

      expect(await hasEmailOptIn(testEmail, scope1)).toBe(true);
      expect(await hasEmailOptIn(testEmail, scope2)).toBe(false);
    });
  });

  describe('End-to-End Flow', () => {
    it('should handle complete unsubscribe flow', async () => {
      // 1. Generate unsubscribe token
      const token = generateUnsubscribeToken(testEmail, testScope);

      // 2. Verify token
      const verified = verifyUnsubscribeToken(token);
      expect(verified.email).toBe(testEmail);
      expect(verified.scope).toBe(testScope);

      // 3. Update opt-in status
      await updateEmailOptIn(verified.email, verified.scope, false);

      // 4. Verify opt-in status is updated
      const hasOptIn = await hasEmailOptIn(testEmail, testScope);
      expect(hasOptIn).toBe(false);
    });

    it('should handle resubscribe flow', async () => {
      // 1. Unsubscribe
      const token = generateUnsubscribeToken(testEmail, testScope);
      const verified = verifyUnsubscribeToken(token);
      await updateEmailOptIn(verified.email, verified.scope, false);

      // 2. Resubscribe
      await updateEmailOptIn(testEmail, testScope, true);

      // 3. Verify opt-in status
      const hasOptIn = await hasEmailOptIn(testEmail, testScope);
      expect(hasOptIn).toBe(true);
    });
  });
}); 