import { create } from 'zustand';
import { createBrowserClient } from '@supabase/ssr';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { useTeamStore } from './teamStore';
import type { Database, Document } from '@/types/database';
import { getErrorMessage } from '@/lib/errors';
import { showToast } from '@/lib/toast';
import { classifyDocument, ClassificationResult, ClassificationHistory } from '@/lib/classification';

export interface DocumentFilters {
  type: string | null;
  status: string | null;
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
  uploadDocument: (file: File, metadata: Partial<Document>) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  resetFilters: () => void;
  classifyDocument: (documentId: string) => Promise<void>;
  retryClassification: (documentId: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentStore>((set, get) => {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return {
    documents: [],
    isLoading: false,
    error: null,
    filters: {
      type: null,
      status: null,
      date_from: null,
      date_to: null,
      search: null,
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
    selectedDocuments: [],
    
    setFilters: (filters) => set((state) => ({ 
      filters: { ...state.filters, ...filters } 
    })),
    
    setPagination: (pagination) => set((state) => ({ 
      pagination: { ...state.pagination, ...pagination } 
    })),
    
    setSelectedDocuments: (documents) => set({ selectedDocuments: documents }),
    
    resetFilters: () => set({
      filters: {
        type: null,
        status: null,
        date_from: null,
        date_to: null,
        search: null,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
      }
    }),
    
    fetchDocuments: async (teamId: string) => {
      set({ isLoading: true, error: null });
      try {
        const { currentTeam } = useTeamStore.getState();
        
        const { filters, pagination } = get();
        const { data, error, count } = await supabase
          .from('documents')
          .select('*', { count: 'exact' })
          .eq('team_id', teamId)
          .order('created_at', { ascending: false })
          .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1);

        if (error) throw error;

        set({ 
          documents: data || [], 
          pagination: { 
            ...pagination, 
            total: count || 0 
          } 
        });
      } catch (error) {
        const message = getErrorMessage(error);
        set({ error: message });
        showToast.error('Error', message);
      } finally {
        set({ isLoading: false });
      }
    },

    uploadDocument: async (file, metadata) => {
      set({ isLoading: true, error: null });
      try {
        const { currentTeam } = useTeamStore.getState();
        if (!currentTeam) throw new Error('No team selected');

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${currentTeam.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create initial document record
        const { data: document, error: dbError } = await supabase
          .from('documents')
          .insert([{ 
            ...metadata, 
            team_id: currentTeam.id,
            file_path: filePath,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            status: 'pending',
            classification_history: []
          }])
          .select()
          .single();

        if (dbError) throw dbError;

        // Trigger classification
        try {
          const classification = await classifyDocument(file);
          
          const { error: updateError } = await supabase
            .from('documents')
            .update({
              type: classification.type,
              confidence_score: classification.confidence,
              classification_reason: classification.reason,
              status: 'classified',
              classification_history: [{
                timestamp: new Date().toISOString(),
                ...classification
              }]
            })
            .eq('id', document.id);

          if (updateError) throw updateError;

          document.type = classification.type;
          document.confidence_score = classification.confidence;
          document.classification_reason = classification.reason;
          document.status = 'classified';
          document.classification_history = [{
            timestamp: new Date().toISOString(),
            ...classification
          }];
        } catch (classificationError) {
          console.error('Classification error:', classificationError);
          // Don't throw - document is still uploaded
          showToast.error('Warning', 'Document uploaded but classification failed');
        }

        set((state) => ({ 
          documents: [document, ...state.documents] 
        }));

        showToast.success('Success', 'Document uploaded successfully');
        return document;
      } catch (error) {
        const message = getErrorMessage(error);
        set({ error: message });
        showToast.error('Error', message);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deleteDocument: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const document = get().documents.find(d => d.id === id);
        if (!document) throw new Error('Document not found');

        const { error: deleteError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);

        if (deleteError) throw deleteError;

        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id)
        }));

        showToast.success('Success', 'Document deleted successfully');
      } catch (error) {
        const message = getErrorMessage(error);
        set({ error: message });
        showToast.error('Error', message);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    classifyDocument: async (documentId) => {
      set({ isLoading: true, error: null });
      try {
        const document = get().documents.find(d => d.id === documentId);
        if (!document) throw new Error('Document not found');

        const { data: fileData, error: downloadError } = await supabase.storage
          .from('documents')
          .download(document.file_path);

        if (downloadError) throw downloadError;

        // Convert Blob to File
        const file = new File([fileData], document.name, {
          type: document.file_type || 'application/octet-stream'
        });

        const classification = await classifyDocument(file);
        
        const { error: updateError } = await supabase
          .from('documents')
          .update({
            type: classification.type,
            confidence_score: classification.confidence,
            classification_reason: classification.reason,
            status: 'classified',
            classification_history: [
              ...(document.classification_history || []),
              {
                timestamp: new Date().toISOString(),
                ...classification
              }
            ]
          })
          .eq('id', documentId);

        if (updateError) throw updateError;

        set((state) => ({
          documents: state.documents.map(doc => 
            doc.id === documentId 
              ? {
                  ...doc,
                  type: classification.type,
                  confidence_score: classification.confidence,
                  classification_reason: classification.reason,
                  status: 'classified',
                  classification_history: [
                    ...(doc.classification_history || []),
                    {
                      timestamp: new Date().toISOString(),
                      ...classification
                    }
                  ]
                }
              : doc
          )
        }));

        showToast.success('Success', 'Document classified successfully');
      } catch (error) {
        const message = getErrorMessage(error);
        set({ error: message });
        showToast.error('Error', message);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    retryClassification: async (documentId) => {
      return get().classifyDocument(documentId);
    }
  };
}); 