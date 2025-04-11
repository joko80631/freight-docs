import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from './teamStore';
import type { Database, Document } from '@/types/database';
import { getErrorMessage } from '@/lib/errors';
import { showToast } from '@/lib/toast';

export interface DocumentFilters {
  document_type: string | null;
  classification_confidence: 'high' | 'medium' | 'low' | null;
  load_status: 'linked' | 'unlinked' | null;
  date_from: string | null;
  date_to: string | null;
  search: string | null;
}

interface DocumentPagination {
  page: number;
  limit: number;
  total: number;
}

interface DocumentStore {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  filters: DocumentFilters;
  pagination: DocumentPagination;
  selectedDocuments: Document[];
  setFilters: (filters: Partial<DocumentFilters>) => void;
  setPagination: (pagination: Partial<DocumentPagination>) => void;
  setSelectedDocuments: (documents: Document[]) => void;
  fetchDocuments: (teamId: string) => Promise<void>;
  uploadDocument: (file: File, metadata: Record<string, any>) => Promise<Document>;
  resetFilters: () => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,
  filters: {
    document_type: null,
    classification_confidence: null,
    load_status: null,
    date_from: null,
    date_to: null,
    search: null
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  selectedDocuments: [],

  setFilters: (filters) => {
    set({ 
      filters: { ...get().filters, ...filters },
      pagination: {
        ...get().pagination,
        page: 1
      }
    });
  },

  setPagination: (pagination) => set({ 
    pagination: { ...get().pagination, ...pagination }
  }),

  setSelectedDocuments: (documents) => set({ selectedDocuments: documents }),

  fetchDocuments: async (teamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();

      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      
      if (filters.document_type) queryParams.append('documentType', filters.document_type);
      if (filters.classification_confidence) queryParams.append('confidence', filters.classification_confidence);
      if (filters.load_status) queryParams.append('loadStatus', filters.load_status);
      if (filters.date_from) queryParams.append('dateFrom', filters.date_from);
      if (filters.date_to) queryParams.append('dateTo', filters.date_to);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(
        `/api/documents?team_id=${teamId}&${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      set({
        documents: data.documents?.filter(Boolean) ?? [],
        pagination: {
          ...pagination,
          total: data.total ?? 0,
        },
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      showToast.error('Error', errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  uploadDocument: async (file: File, metadata: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClientComponentClient<Database>();
      const { currentTeam } = useTeamStore.getState();
      
      if (!currentTeam?.id) {
        throw new Error('No team selected');
      }
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`${currentTeam.id}/${file.name}`, file);
        
      if (uploadError) throw uploadError;
      
      // Create document record
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert({
          team_id: currentTeam.id,
          name: file.name,
          file_path: uploadData.path,
          ...metadata,
        })
        .select()
        .single();
        
      if (documentError) throw documentError;
      
      showToast.success('Document Uploaded', 'Your document has been successfully uploaded');
      return document;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      showToast.error('Upload Failed', errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetFilters: () => set({
    filters: {
      document_type: null,
      classification_confidence: null,
      load_status: null,
      date_from: null,
      date_to: null,
      search: null
    },
    pagination: {
      ...get().pagination,
      page: 1
    }
  }),
})); 