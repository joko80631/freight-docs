export interface ClassificationHistoryEntry {
  id: string;
  type: string;
  confidence: number;
  reason?: string;
  timestamp: string;
  changed_by?: string;
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
  confidence: number;
  load_id?: string;
  load?: {
    id: string;
    reference_number?: string;
    origin: string;
    destination: string;
  };
  uploaded_at: string;
  status: 'pending' | 'processed' | 'error';
  classification_history: ClassificationHistoryEntry[];
  events: DocumentEvent[];
  url?: string;
} 