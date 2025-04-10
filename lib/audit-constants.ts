export const AUDIT_ACTIONS = {
  CLASSIFY: 'CLASSIFY',
  RECLASSIFY: 'RECLASSIFY',
  UPLOAD: 'UPLOAD',
  DELETE: 'DELETE',
  UPDATE: 'UPDATE',
  CREATE: 'CREATE'
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]; 