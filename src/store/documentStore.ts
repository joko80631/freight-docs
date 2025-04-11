import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  document_type: string;
  confidence: number;
  load_id: string | null;
  team_id: string;
  created_at: string;
  updated_at: string;
}

interface DocumentFilters {
  type?: string;
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
        .order('created_at', { ascending: false })
        .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1);

      // Apply filters
      if (filters.type) {
        query = query.eq('document_type', filters.type);
      }
      if (filters.confidence !== undefined) {
        query = query.gte('confidence', filters.confidence);
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