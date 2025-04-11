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

// Template data interface that can be extended
export interface TemplateData extends BaseTemplateData {
  [key: string]: any;
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

export interface LoadStatusData extends BaseTemplateData {
  loadNumber: string;
  status: string;
  updatedBy: string;
  details?: string;
  loadUrl: string;
}

export interface TeamInviteData extends BaseTemplateData {
  teamName: string;
  inviterName: string;
  inviteUrl: string;
  role?: string;
  expiresIn?: string;
}

// Union type of all specific template data types
export type SpecificTemplateData = 
  | DocumentUploadData 
  | MissingDocumentData 
  | LoadStatusData 
  | TeamInviteData;

export interface EmailTemplate {
  subject: string;
  html: string;
  version: string;
}

// Template version tracking
export const TEMPLATE_VERSIONS = {
  'document-upload': '1.0.0',
  'missing-document': '1.0.0',
  'load-status': '1.0.0',
  'team-invite': '1.0.0',
} as const;

export type TemplateName = keyof typeof TEMPLATE_VERSIONS; 