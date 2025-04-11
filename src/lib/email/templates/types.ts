export interface EmailTemplate {
  type: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  unsubscribeUrl?: string;
  version: string;
  metadata?: Record<string, unknown>;
}

export enum TEMPLATE_VERSIONS {
  'document-upload' = 'v1',
  'load-status' = 'v1',
  'team-invite' = 'v1',
  'team-role-update' = 'v1',
  'missing-document' = 'v1',
  'document-uploaded' = 'v1',
  'classification-result' = 'v1',
  'load-status-update' = 'v1',
}

export interface RenderedEmailTemplate {
  subject: string;
  html: string;
  text?: string;
  version: string;
  metadata?: Record<string, unknown>;
}

export interface EmailTemplateData {
  [key: string]: unknown;
} 