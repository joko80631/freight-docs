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
  classification_history?: {
    id: string;
    type: string;
    confidence: number;
    timestamp: string;
    reason?: string;
  }[];
  events?: {
    id: string;
    type: string;
    timestamp: string;
    details: string;
  }[];
} 