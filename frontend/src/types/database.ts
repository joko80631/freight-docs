/** Status of a document in the classification process */
export type DocumentStatus = 'pending' | 'classified' | 'error';

/** Represents a document in the system */
export interface Document {
  /** Unique identifier for the document */
  id: string;
  /** ID of the team that owns this document */
  team_id: string;
  /** Original name of the uploaded file */
  name: string;
  /** Path to the file in storage */
  file_path: string;
  /** Classification type of the document (e.g., 'bol', 'pod', 'invoice') */
  type: string | null;
  /** Current status of the document */
  status: DocumentStatus;
  /** Confidence score of the classification (0-1) */
  confidence_score: number | null;
  /** Explanation for the classification decision */
  classification_reason: string | null;
  /** Timestamp when the document was created */
  created_at: string;
  /** Timestamp when the document was last updated */
  updated_at: string | null;
}

/** Represents a load/shipment in the system */
export interface Load {
  /** Unique identifier for the load */
  id: string;
  /** ID of the team that owns this load */
  team_id: string;
  /** Reference number for the load */
  reference_number: string;
  /** Current status of the load */
  status: string;
  /** Origin location of the load */
  origin: string;
  /** Destination location of the load */
  destination: string;
  /** Timestamp when the load was created */
  created_at: string;
  /** Timestamp when the load was last updated */
  updated_at: string | null;
  /** Associated documents for this load */
  documents?: {
    id: string;
    type: string;
    status: string;
    file_url: string;
    file_name: string;
  }[];
}

/** Database schema definition */
export interface Database {
  public: {
    Tables: {
      /** Loads table definition */
      loads: {
        Row: Load;
        Insert: Omit<Load, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Load, 'id'>>;
      };
      /** Documents table definition */
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Document, 'id'>>;
      };
    };
  };
} 