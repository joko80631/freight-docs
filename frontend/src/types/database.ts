export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';
export type DocumentType = 'POD' | 'BOL' | 'INVOICE';
export type DocumentStatus = 'RECEIVED' | 'MISSING' | 'INVALID' | 'pending' | 'classified' | 'rejected';
export type LoadStatus = 'Pending' | 'active' | 'completed';

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Load {
  id: string;
  user_id: string;
  team_id: string;
  load_number: string;
  carrier_name: string;
  carrier_mc_number?: string;
  carrier_dot_number?: string;
  driver_name?: string;
  driver_phone?: string;
  status: LoadStatus;
  delivery_date: string;
  created_at: string;
  updated_at: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  load_id: string;
  team_id: string;
  type: DocumentType;
  status: DocumentStatus;
  file_path?: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
  updated_at: string;
  load?: Load;
  classification_confidence?: number;
}

export interface LoadEvent {
  id: string;
  load_id: string;
  type: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Team, 'id'>>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TeamMember, 'team_id' | 'user_id'>>;
      };
      loads: {
        Row: Load;
        Insert: Omit<Load, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Load, 'id'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Document, 'id'>>;
      };
      load_events: {
        Row: LoadEvent;
        Insert: Omit<LoadEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<LoadEvent, 'id'>>;
      };
    };
  };
} 