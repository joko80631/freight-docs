import { LoadStatus } from '@/src/constants/loads';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
        Row: {
          id: string
          created_at: string
          load_number: string
          origin: string
          destination: string
          status: LoadStatus
          customer_name: string | null
          notes: string | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          load_number: string
          origin: string
          destination: string
          status: LoadStatus
          customer_name?: string | null
          notes?: string | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          load_number?: string
          origin?: string
          destination?: string
          status?: LoadStatus
          customer_name?: string | null
          notes?: string | null
          team_id?: string
          updated_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          created_at: string
          file_name: string
          file_url: string
          load_id: string
          team_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          file_name: string
          file_url: string
          load_id: string
          team_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          file_name?: string
          file_url?: string
          load_id?: string
          team_id?: string
          type?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 