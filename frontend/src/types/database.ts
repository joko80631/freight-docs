export interface Load {
  id: string;
  team_id: string;
  reference_number: string;
  status: string;
  origin: string;
  destination: string;
  created_at: string;
  updated_at: string | null;
  documents?: {
    id: string;
    type: string;
    status: string;
    file_url: string;
    file_name: string;
  }[];
}

export interface Database {
  public: {
    Tables: {
      loads: {
        Row: Load;
        Insert: Omit<Load, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Load, 'id'>>;
      };
    };
  };
} 