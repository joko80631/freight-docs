export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      loads: {
        Row: {
          id: string;
          team_id: string;
          reference_number: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          reference_number: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          reference_number?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          team_id: string;
          load_id?: string;
          name: string;
          type: string;
          storage_path: string;
          confidence_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          load_id?: string;
          name: string;
          type: string;
          storage_path: string;
          confidence_score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          load_id?: string;
          name?: string;
          type?: string;
          storage_path?: string;
          confidence_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 