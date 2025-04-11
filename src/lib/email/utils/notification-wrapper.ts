import { EmailTemplate } from '../templates/types';
import { EmailProvider } from '../providers/types';
import { EmailError, EmailErrorCode } from '../errors';

export class NotificationWrapper {
  constructor(private provider: EmailProvider) {}

  async send(template: EmailTemplate): Promise<void> {
    try {
      // Validate template
      this.validateTemplate(template);

      // Add default values
      const enrichedTemplate = this.enrichTemplate(template);

      // Send email
      await this.provider.send(enrichedTemplate);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private validateTemplate(template: EmailTemplate): void {
    if (!template.to) {
      throw new EmailError(EmailErrorCode.INVALID_RECIPIENT, 'Recipient email is required');
    }
    if (!template.subject) {
      throw new EmailError(EmailErrorCode.INVALID_SUBJECT, 'Email subject is required');
    }
    if (!template.html) {
      throw new EmailError(EmailErrorCode.INVALID_CONTENT, 'Email content is required');
    }
  }

  private enrichTemplate(template: EmailTemplate): EmailTemplate {
    return {
      ...template,
      text: template.text || this.stripHtml(template.html),
    };
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  private handleError(error: unknown): EmailError {
    if (error instanceof EmailError) {
      return error;
    }

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new EmailError(EmailErrorCode.UNKNOWN, message, error);
  }
} 