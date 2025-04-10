export interface Load {
  id: string;
  team_id: string;
  load_number: string;
  status: string;
  origin: string;
  destination: string;
  created_at: string;
  delivery_date: string;
  vehicle_id?: string;
  driver_id?: string;
  customer_name?: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  team_id: string;
  load_id?: string;
  type: string;
  status: string;
  file_url: string;
  file_name: string;
  created_at: string;
  confidence?: number;
}

export interface Database {
  public: {
    Tables: {
      loads: {
        Row: Load;
        Insert: Omit<Load, 'id' | 'created_at'>;
        Update: Partial<Omit<Load, 'id' | 'created_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at'>;
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
    };
  };
} 