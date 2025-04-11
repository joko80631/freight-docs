import { baseTemplate } from './base';
import { documentUploadTemplate } from './document-upload';
import { missingDocumentTemplate } from './missing-document';
// import { loadStatusTemplate } from './load-status';
// import { teamInviteTemplate } from './team-invite';

// Template version tracking
export const TEMPLATE_VERSIONS = {
  'document-upload': '1.0.0',
  'missing-document': '1.0.0',
  // 'load-status': '1.0.0',
  // 'team-invite': '1.0.0',
} as const;

// Base template data that all templates must include
export interface BaseTemplateData {
  userId?: string;
  documentId?: string;
  loadId?: string;
  teamId?: string;
  unsubscribeUrl?: string;
  recipientName?: string;
  recipientEmail?: string;
}

// Specific template data types
export interface DocumentUploadData extends BaseTemplateData {
  documentType: string;
  uploadedBy: string;
  documentUrl: string;
  loadNumber?: string;
  dueDate?: string;
}

export interface MissingDocumentData extends BaseTemplateData {
  documentType: string;
  dueDate: string;
  loadNumber?: string;
  uploadUrl: string;
}

// export interface LoadStatusData extends BaseTemplateData {
//   loadNumber: string;
//   status: string;
//   updatedBy: string;
//   details?: string;
//   loadUrl: string;
// }

// export interface TeamInviteData extends BaseTemplateData {
//   teamName: string;
//   inviterName: string;
//   inviteUrl: string;
//   role?: string;
//   expiresIn?: string;
// }

// Union type of all template data types
export type TemplateData = 
  | DocumentUploadData 
  | MissingDocumentData;
  // | LoadStatusData 
  // | TeamInviteData;

export type TemplateName = keyof typeof TEMPLATE_VERSIONS;

export interface RenderedEmailTemplate {
  subject: string;
  html: string;
  version: string;
}

// Template function type with proper typing
type TemplateFunction<T extends TemplateData> = (data: T) => Promise<RenderedEmailTemplate>;

// Strongly typed template map
const templates: Record<TemplateName, TemplateFunction<any>> = {
  'document-upload': documentUploadTemplate,
  'missing-document': missingDocumentTemplate,
  // 'load-status': loadStatusTemplate,
  // 'team-invite': teamInviteTemplate,
};

/**
 * Validates that all required data fields are present for a template
 */
export function validateTemplateData(
  templateName: TemplateName,
  data: Record<string, any>
): { isValid: boolean; errors: string[] } {
  const requiredFields: Record<TemplateName, string[]> = {
    // 'team-invite': ['teamName', 'inviterName', 'inviteUrl'],
    'missing-document': ['documentType', 'dueDate', 'uploadUrl'],
    'document-upload': ['documentType', 'uploadedBy', 'documentUrl'],
    // 'load-status': ['loadNumber', 'status', 'updatedBy', 'loadUrl'],
  };

  const fields = requiredFields[templateName];
  const errors: string[] = [];

  for (const field of fields) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Renders an email template with the provided data
 */
export async function renderTemplate(
  templateName: TemplateName,
  data: TemplateData
): Promise<RenderedEmailTemplate> {
  // Validate template data
  const validation = validateTemplateData(templateName, data);
  if (!validation.isValid) {
    throw new Error(
      `Invalid template data for ${templateName}: ${validation.errors.join(', ')}`
    );
  }

  // Get the template function
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template ${templateName} not found`);
  }

  // Render the template
  const rendered = await template(data);

  // Add version information
  return {
    ...rendered,
    version: TEMPLATE_VERSIONS[templateName],
  };
}

/**
 * Gets the current version of a template
 */
export function getTemplateVersion(templateName: TemplateName): string {
  return TEMPLATE_VERSIONS[templateName];
}

// Export base template and its types
export { baseTemplate };
export type { BaseTemplateProps } from './base'; 