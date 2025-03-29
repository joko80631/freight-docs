import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { supabase } from '../src/index.js';

describe('Authentication', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticateUser middleware', () => {
    it('should accept valid Supabase JWT', async () => {
      // Mock Supabase auth response
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      });

      const response = await request(app)
        .get('/api/loads')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(supabase.auth.getUser).toHaveBeenCalledWith('valid-token');
    });

    it('should reject missing token with 401', async () => {
      const response = await request(app)
        .get('/api/loads');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'No token provided' });
    });

    it('should reject invalid token with 401', async () => {
      // Mock Supabase auth error
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Invalid token')
      });

      const response = await request(app)
        .get('/api/loads')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid token' });
    });
  });
}); 