import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { supabase } from '../src/index.js';
import { classifyDocument } from '../src/services/openaiService.js';

describe('Documents API', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  const mockDocument = {
    id: 'test-doc-id',
    user_id: mockUser.id,
    load_id: 'test-load-id',
    file_url: 'https://example.com/doc.pdf',
    type: 'bill_of_lading',
    status: 'pending'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  describe('POST /api/documents/upload', () => {
    it('should reject invalid file types', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', 'Bearer valid-token')
        .attach('file', Buffer.from('test'), {
          filename: 'test.exe',
          contentType: 'application/x-msdownload'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should upload document successfully with classification', async () => {
      // Mock Supabase storage upload
      supabase.storage.mockImplementationOnce(() => ({
        from: vi.fn().mockReturnThis(),
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: mockDocument.file_url }
        })
      }));

      // Mock Supabase document insert
      supabase.from.mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockDocument,
          error: null
        })
      }));

      // Mock document classification
      classifyDocument.mockResolvedValueOnce('bill_of_lading');

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', 'Bearer valid-token')
        .attach('file', Buffer.from('test'), {
          filename: 'bol.pdf',
          contentType: 'application/pdf'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockDocument);
      expect(classifyDocument).toHaveBeenCalledWith('bol.pdf');
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should return document metadata for correct user', async () => {
      // Mock Supabase select response
      supabase.from.mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockDocument,
          error: null
        })
      }));

      const response = await request(app)
        .get(`/api/documents/${mockDocument.id}`)
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocument);
    });

    it('should return 404 for non-existent document', async () => {
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
        .get('/api/documents/non-existent-id')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Document not found' });
    });
  });

  describe('GET /api/documents/:id/download', () => {
    it('should generate signed URL for document', async () => {
      const mockSignedUrl = 'https://example.com/signed-doc.pdf';

      // Mock Supabase select response
      supabase.from.mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockDocument,
          error: null
        })
      }));

      // Mock Supabase storage signed URL
      supabase.storage.mockImplementationOnce(() => ({
        from: vi.fn().mockReturnThis(),
        createSignedUrl: vi.fn().mockResolvedValue({
          data: { signedUrl: mockSignedUrl },
          error: null
        })
      }));

      const response = await request(app)
        .get(`/api/documents/${mockDocument.id}/download`)
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ url: mockSignedUrl });
    });
  });
}); 