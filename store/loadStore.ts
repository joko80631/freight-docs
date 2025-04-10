import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

interface LoadFilters {
  status?: string;
  dateRange?: string;
  search?: string;
}

interface LoadPagination {
  page: number;
  limit: number;
}

interface LoadStore {
  loads: any[];
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

  fetchLoads: async (teamId) => {
    if (!teamId) return;
    
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient<Database>();
      const { filters, pagination } = get();

      let query = supabase
        .from('loads')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.dateRange) {
        const today = new Date();
        let startDate = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(today.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        }
        
        if (filters.dateRange !== '') {
          query = query
            .gte('created_at', startDate.toISOString())
            .lte('created_at', today.toISOString());
        }
      }
      if (filters.search) {
        query = query.or(`load_number.ilike.%${filters.search}%,origin.ilike.%${filters.search}%,destination.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ loads: data ?? [], isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
    }
  }
})); 