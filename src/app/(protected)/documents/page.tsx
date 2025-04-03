'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from './components/DocumentList';
import { DocumentFilters } from './components/DocumentFilters';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface DocumentFilters {
  type?: string;
  confidence?: number;
  loadId?: string;
}

interface Document {
  id: string;
  name: string;
  storage_path: string;
  type: string;
  confidence_score: number;
  uploaded_at: string;
  loads?: { id: string; reference_number: string } | null;
}

export default function DocumentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState<DocumentFilters>({});
  const { currentTeam } = useTeamStore();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const fetchDocuments = async () => {
    if (!currentTeam?.id) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('documents')
        .select('*, loads(id, reference_number)', { count: 'exact' })
        .eq('team_id', currentTeam.id)
        .order('uploaded_at', { ascending: false });
        
      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.confidence) {
        query = query.gte('confidence_score', filters.confidence);
      }
      
      if (filters.loadId) {
        query = query.eq('load_id', filters.loadId);
      }
      
      // Apply pagination
      query = query.range(page * pageSize, (page + 1) * pageSize - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setDocuments(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentTeam?.id) {
      fetchDocuments();
    }
  }, [currentTeam?.id, page, pageSize, filters]);
  
  const handleViewDocument = (id) => {
    router.push(`/documents/${id}`);
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  const handleUploadComplete = () => {
    setShowUploadModal(false);
    fetchDocuments();
    toast({
      title: 'Upload Complete',
      description: 'Your document has been uploaded and classified.'
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your freight documents
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>
      
      <DocumentFilters onFilterChange={handleFilterChange} />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <DocumentList 
          documents={documents}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onViewDocument={handleViewDocument}
        />
      )}
      
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
            <DocumentUpload onUploadComplete={handleUploadComplete} />
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
} 