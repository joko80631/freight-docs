import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database, Load } from '@/types/database';

interface LoadFilters {
  status: string[];
  dateRange: { start: string; end: string } | null;
  customer: string | null;
  search: string;
}

interface LoadPagination {
  page: number;
  pageSize: number;
  total: number;
}

interface LoadStore {
  loads: Load[];
  isLoading: boolean;
  error: string | null;
  filters: LoadFilters;
  pagination: LoadPagination;
  fetchLoads: (teamId: string, filters?: Partial<LoadFilters>) => Promise<void>;
}

export const useLoadStore = create<LoadStore>((set, get) => ({
  loads: [],
  isLoading: false,
  error: null,
  filters: {
    status: [],
    dateRange: null,
    customer: null,
    search: ''
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0
  },

  fetchLoads: async (teamId: string, filters: Partial<LoadFilters> = {}) => {
    if (!teamId) return;
    
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient<Database>();
      let query = supabase
        .from('loads')
        .select('*, documents(id, type, status)')
        .eq('team_id', teamId);

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.dateRange?.start) {
        query = query.gte('created_at', filters.dateRange.start);
      }
      if (filters.dateRange?.end) {
        query = query.lte('created_at', filters.dateRange.end);
      }
      if (filters.customer) {
        query = query.ilike('customer_name', `%${filters.customer}%`);
      }
      if (filters.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,origin.ilike.%${filters.search}%,destination.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const { page, pageSize } = get().pagination;
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      set({
        loads: data?.filter(Boolean) ?? [],
        pagination: {
          ...get().pagination,
          total: count ?? 0
        },
        filters: {
          ...get().filters,
          ...filters
        },
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        isLoading: false 
      });
    }
  },
})); 