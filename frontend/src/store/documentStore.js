import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useTeamStore } from './teamStore';

const useDocumentStore = create((set, get) => ({
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

  // Actions
  setFilters: (filters) => {
    // Reset to page 1 when filters change
    set({ 
      filters,
      pagination: {
        ...get().pagination,
        page: 1
      }
    });
  },
  setPagination: (pagination) => set({ pagination }),
  setSelectedDocuments: (documents) => set({ selectedDocuments: documents }),

  fetchDocuments: async (teamId) => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      const response = await fetch(
        `/api/teams/${teamId}/documents?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      set({
        documents: data.documents,
        pagination: {
          ...pagination,
          total: data.total,
        },
      });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadDocument: async (file, metadata) => {
    const { currentTeam } = useTeamStore.getState();
    if (!currentTeam?.id) throw new Error('No team selected');

    try {
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
        // Update total count
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

  updateDocument: async (documentId, updates) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      const updatedDocument = await response.json();
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === documentId ? updatedDocument : doc
        ),
      }));

      return updatedDocument;
    } catch (error) {
      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    const { currentTeam } = useTeamStore.getState();
    if (!currentTeam?.id) throw new Error('No team selected');

    try {
      // 1. Get document to delete
      const document = get().documents.find((doc) => doc.id === documentId);
      if (!document) throw new Error('Document not found');

      // 2. Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // 3. Delete document record
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== documentId),
        // Update total count
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1
        }
      }));
    } catch (error) {
      throw error;
    }
  },

  linkToLoad: async (documentId, loadId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ load_id: loadId }),
      });

      if (!response.ok) {
        throw new Error('Failed to link document to load');
      }

      const updatedDocument = await response.json();
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === documentId ? updatedDocument : doc
        ),
      }));

      return updatedDocument;
    } catch (error) {
      throw error;
    }
  },

  unlinkFromLoad: async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/unlink`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to unlink document from load');
      }

      const updatedDocument = await response.json();
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === documentId ? updatedDocument : doc
        ),
      }));

      return updatedDocument;
    } catch (error) {
      throw error;
    }
  },

  reclassifyDocument: async (documentId, documentType, reason) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/reclassify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_type: documentType, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reclassify document');
      }

      const updatedDocument = await response.json();
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === documentId ? updatedDocument : doc
        ),
      }));

      return updatedDocument;
    } catch (error) {
      throw error;
    }
  },

  // Batch operations
  batchDelete: async (documentIds) => {
    try {
      const response = await fetch('/api/documents/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_ids: documentIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete documents');
      }

      set((state) => ({
        documents: state.documents.filter(
          (doc) => !documentIds.includes(doc.id)
        ),
        selectedDocuments: [],
        // Update total count
        pagination: {
          ...state.pagination,
          total: state.pagination.total - documentIds.length
        }
      }));
    } catch (error) {
      throw error;
    }
  },

  batchLinkToLoad: async (documentIds, loadId) => {
    try {
      const response = await fetch('/api/documents/batch-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_ids: documentIds, load_id: loadId }),
      });

      if (!response.ok) {
        throw new Error('Failed to link documents to load');
      }

      const updatedDocuments = await response.json();
      set((state) => ({
        documents: state.documents.map((doc) => {
          const updated = updatedDocuments.find((u) => u.id === doc.id);
          return updated || doc;
        }),
        selectedDocuments: [],
      }));
    } catch (error) {
      throw error;
    }
  },

  // Add this new function for batch downloads
  batchDownload: async (documentIds) => {
    try {
      set({ isLoading: true });
      
      // Get the documents with their file URLs
      const documents = get().documents.filter(doc => documentIds.includes(doc.id));
      
      // Track documents with missing URLs
      const missingUrls = [];
      
      // Create a delay between downloads to avoid popup blocking
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Download each document with a delay between them
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        if (doc.file_url) {
          // Open in a new tab to avoid popup blocking
          window.open(doc.file_url, '_blank');
          // Wait 300ms between downloads to avoid popup blocking
          await delay(300);
        } else {
          // Log warning for documents missing file_url
          console.warn(`Document ${doc.id} (${doc.name}) has no file_url and was skipped.`);
          missingUrls.push(doc.id);
        }
      }
      
      return { 
        success: true,
        skippedDocuments: missingUrls.length > 0 ? missingUrls : null
      };
    } catch (error) {
      console.error('Error downloading documents:', error);
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },

  // Add this new function for batch reclassification
  batchReclassify: async (documentIds, documentType, reason) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch('/api/documents/batch-reclassify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_ids: documentIds,
          document_type: documentType,
          reason: reason || null,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reclassify documents');
      }
      
      const data = await response.json();
      
      // Update the documents in the store
      set((state) => {
        const updatedDocuments = state.documents.map((doc) => {
          if (documentIds.includes(doc.id)) {
            return {
              ...doc,
              document_type: documentType,
              reclassification_reason: reason || null,
            };
          }
          return doc;
        });
        
        return { documents: updatedDocuments };
      });
      
      return data;
    } catch (error) {
      console.error('Error reclassifying documents:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDocumentStore; 