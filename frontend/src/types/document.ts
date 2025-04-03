export interface Document {
  id: string;
  name: string;
  storage_path: string;
  type?: 'bol' | 'pod' | 'invoice' | 'other' | null;
  confidence_score?: number | null;
  classified_by?: string | null;
  classified_at?: string | null;
  classification_reason?: string | null;
  source?: 'openai' | 'user' | 'openai_retry' | null;
  team_id: string;
  uploaded_by: string;
  uploaded_at: string;
  size?: number | null;
  mime_type?: string | null;
  load_id?: string | null;
  loads?: {
    id: string;
    reference_number: string;
  } | null;
  classification_history?: ClassificationHistory[];
}

export interface ClassificationHistory {
  id: string;
  document_id: string;
  previous_type: string | null;
  new_type: string;
  confidence_score: number | null;
  classified_by: string;
  classified_at: string;
  source: 'openai' | 'user' | 'openai_retry';
  reason: string | null;
  created_at: string;
}

export interface ClassificationResult {
  type: 'bol' | 'pod' | 'invoice' | 'other';
  confidence: number;
  reason?: string;
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