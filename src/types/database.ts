export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DocumentType = 'bol' | 'pod' | 'invoice' | 'other';
export type DocumentStatus = 'received' | 'missing' | 'invalid' | 'pending' | 'processed' | 'rejected';
export type LoadStatus = 'pending' | 'active' | 'completed';

export interface Load {
  id: string;
  team_id: string;
  load_number: string;
  status: LoadStatus;
  origin: string;
  destination: string;
  created_at: string;
  updated_at: string | null;
  delivery_date: string;
  vehicle_id?: string;
  driver_id?: string;
  customer_name?: string | null;
  carrier_name?: string;
  carrier_mc_number?: string;
  carrier_dot_number?: string;
  driver_name?: string;
  driver_phone?: string;
  notes?: string | null;
  documents?: Document[];
}

export interface Document {
  id: string;
  team_id: string;
  load_id?: string;
  type: DocumentType;
  status: DocumentStatus;
  file_url: string;
  file_name: string;
  file_path?: string;
  created_at: string;
  updated_at: string | null;
  confidence?: number;
  load?: Load;
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
      loads: {
        Row: {
          id: string;
          team_id: string;
          load_number: string;
          status: LoadStatus;
          origin: string;
          destination: string;
          created_at: string;
          updated_at: string | null;
          delivery_date: string;
          vehicle_id?: string;
          driver_id?: string;
          customer_name: string | null;
          carrier_name?: string;
          carrier_mc_number?: string;
          carrier_dot_number?: string;
          driver_name?: string;
          driver_phone?: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          load_number: string;
          status: LoadStatus;
          origin: string;
          destination: string;
          created_at?: string;
          updated_at?: string | null;
          delivery_date: string;
          vehicle_id?: string;
          driver_id?: string;
          customer_name?: string | null;
          carrier_name?: string;
          carrier_mc_number?: string;
          carrier_dot_number?: string;
          driver_name?: string;
          driver_phone?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          load_number?: string;
          status?: LoadStatus;
          origin?: string;
          destination?: string;
          created_at?: string;
          updated_at?: string | null;
          delivery_date?: string;
          vehicle_id?: string;
          driver_id?: string;
          customer_name?: string | null;
          carrier_name?: string;
          carrier_mc_number?: string;
          carrier_dot_number?: string;
          driver_name?: string;
          driver_phone?: string;
          notes?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          team_id: string;
          load_id: string;
          type: DocumentType;
          status: DocumentStatus;
          file_url: string;
          file_name: string;
          file_path?: string;
          created_at: string;
          updated_at: string | null;
          confidence?: number;
        };
        Insert: {
          id?: string;
          team_id: string;
          load_id: string;
          type: DocumentType;
          status: DocumentStatus;
          file_url: string;
          file_name: string;
          file_path?: string;
          created_at?: string;
          updated_at?: string | null;
          confidence?: number;
        };
        Update: {
          id?: string;
          team_id?: string;
          load_id?: string;
          type?: DocumentType;
          status?: DocumentStatus;
          file_url?: string;
          file_name?: string;
          file_path?: string;
          created_at?: string;
          updated_at?: string | null;
          confidence?: number;
        };
      };
      load_events: {
        Row: LoadEvent;
        Insert: Omit<LoadEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<LoadEvent, 'id'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 