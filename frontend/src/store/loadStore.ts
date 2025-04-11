import { create } from 'zustand';
import { createBrowserClient } from '@supabase/ssr';
import type { Database, Load } from '@/types/database';
import { getErrorMessage } from '@/lib/errors';
import { api } from '@/lib/api';

interface LoadFilters {
  status?: string;
  carrier_name?: string;
  load_number?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

interface LoadPagination {
  page: number;
  limit: number;
}

interface LoadStore {
  loads: Load[];
  isLoading: boolean;
  error: string | null;
  filters: LoadFilters;
  pagination: LoadPagination;
  setFilters: (filters: LoadFilters) => void;
  setPagination: (pagination: LoadPagination) => void;
  fetchLoads: (teamId: string) => Promise<void>;
  linkDocumentToLoad: (documentId: string, loadId: string) => Promise<void>;
  unlinkDocumentFromLoad: (documentId: string) => Promise<void>;
}

export const useLoadStore = create<LoadStore>((set, get) => {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return {
    loads: [],
    isLoading: false,
    error: null,
    filters: {},
    pagination: {
      page: 1,
      limit: 10
    },

    setFilters: (filters) => set((state) => ({ 
      filters: { ...state.filters, ...filters } 
    })),

    setPagination: (pagination) => set((state) => ({ 
      pagination: { ...state.pagination, ...pagination } 
    })),

    fetchLoads: async (teamId: string) => {
      set({ isLoading: true, error: null });
      try {
        const { filters, pagination } = get();

        let query = supabase
          .from('loads')
          .select(`
            *,
            documents (
              id,
              type,
              status,
              file_url,
              file_name
            )
          `)
          .eq('team_id', teamId)
          .order('created_at', { ascending: false })
          .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1);

        // Apply filters
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.carrier_name) {
          query = query.ilike('carrier_name', `%${filters.carrier_name}%`);
        }
        if (filters.load_number) {
          query = query.ilike('load_number', `%${filters.load_number}%`);
        }
        if (filters.start_date) {
          query = query.gte('delivery_date', filters.start_date);
        }
        if (filters.end_date) {
          query = query.lte('delivery_date', filters.end_date);
        }
        if (filters.search) {
          query = query.or(`load_number.ilike.%${filters.search}%,carrier_name.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        set({ loads: data || [], isLoading: false });
      } catch (error) {
        set({ 
          error: getErrorMessage(error), 
          isLoading: false 
        });
      }
    },

    linkDocumentToLoad: async (documentId: string, loadId: string) => {
      set({ isLoading: true, error: null });
      try {
        await api.post(`/documents/${documentId}/link-load`, { loadId });
        set({ isLoading: false });
      } catch (error) {
        set({ error: 'Failed to link document to load', isLoading: false });
        throw error;
      }
    },

    unlinkDocumentFromLoad: async (documentId: string) => {
      set({ isLoading: true, error: null });
      try {
        await api.post(`/documents/${documentId}/unlink-load`);
        set({ isLoading: false });
      } catch (error) {
        set({ error: 'Failed to unlink document from load', isLoading: false });
        throw error;
      }
    }
  };
}); 