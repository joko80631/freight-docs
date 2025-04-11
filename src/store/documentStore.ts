import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Document as DocumentType, DocumentType as DocType, DocumentStatus } from '@/types/document';

export interface Document {
  id: string;
  name: string;
  storage_path: string;
  type?: DocType | null;
  confidence_score?: number | null;
  classified_by?: string | null;
  classified_at?: string | null;
  classification_reason?: string | null;
  source?: string | null;
  team_id: string;
  uploaded_by: string;
  uploaded_at: string;
  size?: number | null;
  mime_type?: string | null;
  load_id?: string | null;
  status: DocumentStatus;
  url?: string;
}

interface DocumentFilters {
  type?: DocType;
  status?: DocumentStatus;
  confidence?: number;
  loadId?: string;
  search?: string;
}

interface DocumentPagination {
  page: number;
  limit: number;
}

interface DocumentError {
  message: string;
  code?: string;
}

interface DocumentStore {
  documents: Document[];
  isLoading: boolean;
  error: DocumentError | null;
  filters: DocumentFilters;
  pagination: DocumentPagination;
  setFilters: (filters: DocumentFilters) => void;
  setPagination: (pagination: DocumentPagination) => void;
  fetchDocuments: (teamId: string) => Promise<void>;
  clearError: () => void;
  resetFilters: () => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10
  },

  setFilters: (filters) => set({ filters }),

  setPagination: (pagination) => set({ pagination }),

  clearError: () => set({ error: null }),

  resetFilters: () => set({ 
    filters: {},
    pagination: {
      page: 1,
      limit: 10
    }
  }),

  fetchDocuments: async (teamId) => {
    if (!teamId) {
      set({ 
        error: { 
          message: 'No team selected',
          code: 'NO_TEAM'
        },
        isLoading: false 
      });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient<Database>();
      const { filters, pagination } = get();

      let query = supabase
        .from('documents')
        .select('*')
        .eq('team_id', teamId)
        .order('uploaded_at', { ascending: false })
        .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1);

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.confidence !== undefined) {
        query = query.gte('confidence_score', filters.confidence);
      }
      if (filters.loadId) {
        query = query.eq('load_id', filters.loadId);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      set({ 
        documents: data ?? [], 
        isLoading: false,
        error: null
      });
    } catch (error) {
      const documentError: DocumentError = {
        message: error instanceof Error ? error.message : 'Failed to fetch documents',
        code: error instanceof Error ? (error as any).code : 'UNKNOWN_ERROR'
      };
      set({ 
        error: documentError, 
        isLoading: false,
        documents: []
      });
    }
  }
})); 