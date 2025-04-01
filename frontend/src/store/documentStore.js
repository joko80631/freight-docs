import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useDocumentStore = create((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,
  filters: {
    type: [],
    status: [],
    loadId: null,
    search: ''
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  },

  fetchDocuments: async (teamId, filters = {}) => {
    if (!teamId) return;
    
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .eq('team_id', teamId);

      // Apply filters
      if (filters.type?.length) {
        query = query.in('type', filters.type);
      }
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.loadId) {
        query = query.eq('load_id', filters.loadId);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Apply pagination
      const { page, pageSize } = get().pagination;
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      set({
        documents: data,
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

  uploadDocument: async (file, metadata) => {
    set({ isLoading: true, error: null });
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${metadata.team_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          ...metadata,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        documents: [data, ...state.documents],
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

  updateDocument: async (documentId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        documents: state.documents.map(doc => 
          doc.id === documentId ? data : doc
        ),
        isLoading: false
      }));

      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    set({ isLoading: true, error: null });
    try {
      const document = get().documents.find(doc => doc.id === documentId);
      if (!document) throw new Error('Document not found');

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      set(state => ({
        documents: state.documents.filter(doc => doc.id !== documentId),
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

  clearDocuments: () => {
    set({
      documents: [],
      isLoading: false,
      error: null,
      filters: {
        type: [],
        status: [],
        loadId: null,
        search: ''
      },
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      }
    });
  }
}));

export default useDocumentStore; 