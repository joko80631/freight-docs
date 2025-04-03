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
  classification_history?: Array<{
    id: string;
    type: string;
    confidence: number;
    reason?: string;
    timestamp: string;
  }>;
  events?: {
    id: string;
    type: string;
    timestamp: string;
    details: string;
  }[];
} 