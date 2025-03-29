import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { supabase } from '../src/index.js';

describe('Loads API', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  const mockLoad = {
    id: 'test-load-id',
    load_number: 'LOAD123',
    carrier_name: 'Test Carrier',
    delivery_date: '2024-03-30T00:00:00Z',
    user_id: mockUser.id
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  describe('POST /api/loads', () => {
    it('should create a new load successfully', async () => {
      // Mock Supabase insert response
      supabase.from.mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockLoad,
          error: null
        })
      }));

      const response = await request(app)
        .post('/api/loads')
        .set('Authorization', 'Bearer valid-token')
        .send({
          load_number: 'LOAD123',
          carrier_name: 'Test Carrier',
          delivery_date: '2024-03-30T00:00:00Z'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockLoad);
      expect(supabase.from).toHaveBeenCalledWith('loads');
    });

    it('should reject invalid load data', async () => {
      const response = await request(app)
        .post('/api/loads')
        .set('Authorization', 'Bearer valid-token')
        .send({
          // Missing required fields
          carrier_name: 'Test Carrier'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/loads', () => {
    it('should return loads filtered by user_id', async () => {
      const mockLoads = [mockLoad];
      
      // Mock Supabase select response
      supabase.from.mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockLoads,
          error: null
        })
      }));

      const response = await request(app)
        .get('/api/loads')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLoads);
      expect(supabase.from).toHaveBeenCalledWith('loads');
    });
  });

  describe('GET /api/loads/:id', () => {
    it('should return load details with documents', async () => {
      const mockLoadWithDocs = {
        ...mockLoad,
        documents: [
          {
            id: 'doc1',
            file_url: 'https://example.com/doc1.pdf',
            type: 'bill_of_lading',
            status: 'pending'
          }
        ]
      };

      // Mock Supabase select response with joined documents
      supabase.from.mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockLoadWithDocs,
          error: null
        })
      }));

      const response = await request(app)
        .get(`/api/loads/${mockLoad.id}`)
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLoadWithDocs);
    });

    it('should return 404 for non-existent load', async () => {
      // Mock Supabase select response with no data
      supabase.from.mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }));

      const response = await request(app)
        .get('/api/loads/non-existent-id')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Load not found' });
    });
  });
}); 