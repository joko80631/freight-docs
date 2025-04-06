import { NextRequest } from 'next/server';
import { POST } from '@/app/api/email/preview/route';
import { SAMPLE_DATA } from '@/lib/email/templates/samples';

describe('Email Preview API', () => {
  it('should return rendered email template', async () => {
    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/email/preview', {
      method: 'POST',
      body: JSON.stringify({
        templateName: 'document-upload',
        testData: SAMPLE_DATA['document-upload'],
      }),
    });

    // Call the API endpoint
    const response = await POST(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data.subject).toBeDefined();
    expect(data.html).toBeDefined();
    expect(data.version).toBeDefined();
    expect(data.html).toContain('Bill of Lading');
    expect(data.html).toContain('BOL');
  });

  it('should return error for missing template name', async () => {
    // Create a mock request with missing template name
    const request = new NextRequest('http://localhost:3000/api/email/preview', {
      method: 'POST',
      body: JSON.stringify({
        testData: SAMPLE_DATA['document-upload'],
      }),
    });

    // Call the API endpoint
    const response = await POST(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(400);
    expect(data.error).toBe('Template name is required');
  });

  it('should return error for invalid template name', async () => {
    // Create a mock request with invalid template name
    const request = new NextRequest('http://localhost:3000/api/email/preview', {
      method: 'POST',
      body: JSON.stringify({
        templateName: 'invalid-template',
        testData: {},
      }),
    });

    // Call the API endpoint
    const response = await POST(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to preview email template');
  });

  it('should handle missing test data', async () => {
    // Create a mock request with missing test data
    const request = new NextRequest('http://localhost:3000/api/email/preview', {
      method: 'POST',
      body: JSON.stringify({
        templateName: 'document-upload',
      }),
    });

    // Call the API endpoint
    const response = await POST(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to preview email template');
  });

  it('should render all template types', async () => {
    // Test each template type
    const templates = [
      'document-upload',
      'missing-document',
      'load-status',
      'team-invite',
    ];

    for (const templateName of templates) {
      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/email/preview', {
        method: 'POST',
        body: JSON.stringify({
          templateName,
          testData: SAMPLE_DATA[templateName as keyof typeof SAMPLE_DATA],
        }),
      });

      // Call the API endpoint
      const response = await POST(request);
      
      // Verify the response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.subject).toBeDefined();
      expect(data.html).toBeDefined();
      expect(data.version).toBeDefined();
    }
  });
}); 