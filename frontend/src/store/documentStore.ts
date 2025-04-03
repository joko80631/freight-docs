import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from './teamStore';
import type { Database, Document } from '@/types/database';

interface DocumentFilters {
  documentType: string;
  confidence: string;
  loadStatus: string;
  dateFrom: string;
  dateTo: string;
  search: string;
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
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,
  filters: {
    documentType: '',
    confidence: '',
    loadStatus: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
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
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(
        `/api/teams/${teamId}/documents?${queryParams.toString()}`
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
      set({ error: error instanceof Error ? error.message : 'An unexpected error occurred' });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadDocument: async (file: File, metadata: Record<string, any>) => {
    const { currentTeam } = useTeamStore.getState();
    if (!currentTeam?.id) throw new Error('No team selected');

    try {
      const supabase = createClientComponentClient<Database>();

      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${currentTeam.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Create document record
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: currentTeam.id,
          name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          file_type: fileExt,
          file_size: file.size,
          ...metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document record');
      }

      const document = await response.json();
      
      // Add the new document to the beginning of the list
      set((state) => ({
        documents: [document, ...state.documents],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      }));

      return document;
    } catch (error) {
      throw error;
    }
  },
})); 