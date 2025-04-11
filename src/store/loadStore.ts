import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { Load as LoadType, LoadStatus } from '@/types/database';

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
}

interface LoadFilters {
  status?: LoadStatus;
  dateRange?: string;
  search?: string;
}

interface LoadPagination {
  page: number;
  limit: number;
}

interface LoadError {
  message: string;
  code?: string;
}

interface LoadStore {
  loads: Load[];
  isLoading: boolean;
  error: LoadError | null;
  filters: LoadFilters;
  pagination: LoadPagination;
  setFilters: (filters: LoadFilters) => void;
  setPagination: (pagination: LoadPagination) => void;
  fetchLoads: (teamId: string) => Promise<void>;
  clearError: () => void;
  resetFilters: () => void;
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

  clearError: () => set({ error: null }),

  resetFilters: () => set({ 
    filters: {},
    pagination: {
      page: 1,
      limit: 10
    }
  }),

  fetchLoads: async (teamId) => {
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

      if (error) {
        throw error;
      }

      set({ 
        loads: data ?? [], 
        isLoading: false,
        error: null
      });
    } catch (error) {
      const loadError: LoadError = {
        message: error instanceof Error ? error.message : 'Failed to fetch loads',
        code: error instanceof Error ? (error as any).code : 'UNKNOWN_ERROR'
      };
      set({ 
        error: loadError, 
        isLoading: false,
        loads: []
      });
    }
  }
})); 