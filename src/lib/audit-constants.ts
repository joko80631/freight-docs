export const AUDIT_ACTIONS = {
  UPLOAD: 'upload_document',
  CLASSIFY: 'classify_document',
  RECLASSIFY: 'reclassify_document',
  RETRY_CLASSIFICATION: 'retry_classification',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]; 