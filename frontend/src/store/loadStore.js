import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useLoadStore = create((set, get) => ({
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

  fetchLoads: async (teamId, filters = {}) => {
    if (!teamId) return;
    
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('loads')
        .select('*', { count: 'exact' })
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
        loads: data,
        pagination: {
          ...get().pagination,
          total: count
        },
        filters,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createLoad: async (loadData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('loads')
        .insert([loadData])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        loads: [data, ...state.loads],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        },
        isLoading: false
      }));

      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateLoad: async (loadId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('loads')
        .update(updates)
        .eq('id', loadId)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        loads: state.loads.map(load => 
          load.id === loadId ? data : load
        ),
        isLoading: false
      }));

      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteLoad: async (loadId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('loads')
        .delete()
        .eq('id', loadId);

      if (error) throw error;

      set(state => ({
        loads: state.loads.filter(load => load.id !== loadId),
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1
        },
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  setPagination: (pagination) => {
    set({ pagination });
  },

  clearLoads: () => {
    set({
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
      }
    });
  }
})); 