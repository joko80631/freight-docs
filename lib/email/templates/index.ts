import { baseTemplate } from './base';
import { documentUploadTemplate } from './document-upload';
import { missingDocumentTemplate } from './missing-document';
import { loadStatusTemplate } from './load-status';
import { teamInviteTemplate } from './team-invite';
import {
  BaseTemplateData,
  DocumentUploadData,
  MissingDocumentData,
  LoadStatusData,
  TeamInviteData,
  TemplateData,
  SpecificTemplateData,
  TemplateName,
  EmailTemplate,
  TEMPLATE_VERSIONS
} from './types';

// Template function type with proper typing
type TemplateFunction<T extends TemplateData> = (data: T) => Promise<EmailTemplate>;

// Strongly typed template map
const templates: Record<TemplateName, TemplateFunction<any>> = {
  'document-upload': documentUploadTemplate,
  'missing-document': missingDocumentTemplate,
  'load-status': loadStatusTemplate,
  'team-invite': teamInviteTemplate,
};

/**
 * Validates that all required data fields are present for a template
 * @param templateName The name of the template to validate
 * @param data The data to validate
 * @returns Validation result with detailed error messages
 */
export function validateTemplateData(
  templateName: TemplateName,
  data: Record<string, any>
): { isValid: boolean; errors: string[] } {
  const requiredFields: Record<TemplateName, string[]> = {
    'team-invite': ['teamName', 'inviterName', 'inviteUrl'],
    'missing-document': ['documentType', 'dueDate', 'uploadUrl'],
    'document-upload': ['documentType', 'uploadedBy', 'documentUrl'],
    'load-status': ['loadNumber', 'status', 'updatedBy', 'loadUrl'],
  };

  const fields = requiredFields[templateName];
  const errors: string[] = [];

  fields.forEach((field) => {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    } else if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Field ${field} cannot be empty`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Renders an email template with validation and version tracking
 * @param templateName The name of the template to use
 * @param data The data to pass to the template
 * @returns The rendered email template
 * @throws Error if template not found or validation fails
 */
export async function renderTemplate(
  templateName: TemplateName,
  data: SpecificTemplateData
): Promise<EmailTemplate> {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template ${templateName} not found`);
  }

  // Validate template data
  const validation = validateTemplateData(templateName, data);
  if (!validation.isValid) {
    throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
  }

  // Render the template
  const { subject, html } = await template(data);
  
  // Add version information
  return {
    subject,
    html: baseTemplate({
      content: html,
      title: subject,
      unsubscribeUrl: data.unsubscribeUrl,
    }),
    version: TEMPLATE_VERSIONS[templateName],
  };
}

/**
 * Gets the current version of a template
 * @param templateName The name of the template
 * @returns The version string
 */
export function getTemplateVersion(templateName: TemplateName): string {
  return TEMPLATE_VERSIONS[templateName];
}

// Export base template and its types
export { baseTemplate };
export type { BaseTemplateProps } from './base';

// Re-export types
export type {
  BaseTemplateData,
  DocumentUploadData,
  MissingDocumentData,
  LoadStatusData,
  TeamInviteData,
  TemplateData,
  SpecificTemplateData,
  TemplateName,
  EmailTemplate
}; 