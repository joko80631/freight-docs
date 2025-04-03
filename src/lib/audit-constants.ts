export const AUDIT_ACTIONS = {
  UPLOAD: 'upload_document',
  CLASSIFY: 'classify_document',
  RECLASSIFY: 'reclassify_document',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]; 