export type DocumentType = 'bol' | 'pod' | 'invoice' | 'other';
export type DocumentSource = 'openai' | 'user' | 'openai_retry';
export type DocumentStatus = 'received' | 'missing' | 'invalid' | 'pending' | 'processed' | 'rejected';

export interface ClassificationHistoryEntry {
  id: string;
  document_id: string;
  previous_type: string | null;
  new_type: string;
  confidence_score: number | null;
  classified_by: string;
  classified_at: string;
  source: DocumentSource;
  reason: string | null;
  created_at: string;
}

export interface ClassificationResult {
  type: DocumentType;
  confidence: number;
  reason?: string;
}

export type DocumentEventType = 
  | 'upload'
  | 'reclassify'
  | 'link'
  | 'unlink'
  | 'delete'
  | 'process'
  | 'error';

export interface DocumentEventMeta {
  upload?: { user: string };
  reclassify?: { new_type: string; reason: string; user: string };
  link?: { load_id: string; user: string };
  unlink?: { load_id: string; user: string };
  delete?: { user: string; reason: string };
  process?: { status: 'success' | 'failure'; error?: string };
  error?: { message: string; code: string };
}

export interface DocumentEvent {
  id: string;
  type: DocumentEventType;
  timestamp: string;
  meta?: DocumentEventMeta[keyof DocumentEventMeta];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  document_ids: string[];
  team_id: string;
  user_id: string;
  metadata: Record<string, any>;
  created_at: string;
  users?: {
    email?: string;
    display_name?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
} 