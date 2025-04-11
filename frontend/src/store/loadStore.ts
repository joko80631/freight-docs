import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database, Load } from '@/types/database';
import { getErrorMessage } from '@/lib/errors';

interface LoadFilters {
  status?: string;
  carrier_name?: string;
  load_number?: string;
  start_date?: string;
  end_date?: string;
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
}

export const useLoadStore = create<LoadStore>((set, get) => ({
  loads: [],
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10
  },

  setFilters: (filters) => set({ filters }),

  setPagination: (pagination) => set({ pagination }),

  fetchLoads: async (teamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient<Database>();
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

      const { data, error } = await query.returns<Load[]>();

      if (error) throw error;

      set({ loads: data ?? [] });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  }
})); 