import { renderTemplate } from '@/lib/email/templates';
import { SAMPLE_DATA } from '@/lib/email/templates/samples';
import { MockEmailProvider } from '@/lib/email/providers/mock';
import { sendTemplatedEmail } from '@/lib/email';

describe('Email Templates', () => {
  let mockProvider: MockEmailProvider;

  beforeEach(() => {
    mockProvider = new MockEmailProvider();
  });

  afterEach(() => {
    mockProvider.clearSentEmails();
  });

  describe('Template Rendering', () => {
    it('should render document upload template', async () => {
      const template = await renderTemplate('document-upload', SAMPLE_DATA['document-upload']);
      expect(template.subject).toBeDefined();
      expect(template.html).toContain('Bill of Lading');
      expect(template.html).toContain('BOL');
    });

    it('should render missing document template', async () => {
      const template = await renderTemplate('missing-document', SAMPLE_DATA['missing-document']);
      expect(template.subject).toBeDefined();
      expect(template.html).toContain('BOL');
      expect(template.html).toContain('LOAD-123');
    });

    it('should render load status template', async () => {
      const template = await renderTemplate('load-status', SAMPLE_DATA['load-status']);
      expect(template.subject).toBeDefined();
      expect(template.html).toContain('in-transit');
      expect(template.html).toContain('Chicago, IL');
    });

    it('should render team invite template', async () => {
      const template = await renderTemplate('team-invite', SAMPLE_DATA['team-invite']);
      expect(template.subject).toBeDefined();
      expect(template.html).toContain('John Doe');
      expect(template.html).toContain('Freight Team');
    });
  });

  describe('Template Validation', () => {
    it('should throw error for missing required fields', async () => {
      await expect(
        renderTemplate('document-upload', {})
      ).rejects.toThrow('Template validation failed');
    });

    it('should throw error for invalid template name', async () => {
      await expect(
        renderTemplate('invalid-template' as any, {})
      ).rejects.toThrow('Template invalid-template not found');
    });
  });

  describe('Email Sending', () => {
    it('should send document upload email', async () => {
      await sendTemplatedEmail(
        'document-upload',
        SAMPLE_DATA['document-upload'],
        'test@example.com'
      );

      const email = mockProvider.getLastSentEmail();
      expect(email.options.to).toBe('test@example.com');
      expect(email.options.subject).toContain('Bill of Lading');
      expect(email.options.content).toContain('BOL');
    });

    it('should include unsubscribe link', async () => {
      await sendTemplatedEmail(
        'document-upload',
        SAMPLE_DATA['document-upload'],
        'test@example.com'
      );

      const email = mockProvider.getLastSentEmail();
      expect(email.options.content).toContain('unsubscribe');
    });

    it('should handle multiple recipients', async () => {
      await sendTemplatedEmail(
        'document-upload',
        SAMPLE_DATA['document-upload'],
        ['test1@example.com', 'test2@example.com']
      );

      const email = mockProvider.getLastSentEmail();
      expect(email.options.to).toEqual(['test1@example.com', 'test2@example.com']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data gracefully', async () => {
      await expect(
        renderTemplate('document-upload', {})
      ).rejects.toThrow();
    });

    it('should handle null values gracefully', async () => {
      const data = {
        ...SAMPLE_DATA['document-upload'],
        documentName: null,
      };

      await expect(
        renderTemplate('document-upload', data)
      ).rejects.toThrow();
    });

    it('should handle undefined values gracefully', async () => {
      const data = {
        ...SAMPLE_DATA['document-upload'],
        documentName: undefined,
      };

      await expect(
        renderTemplate('document-upload', data)
      ).rejects.toThrow();
    });
  });
}); 