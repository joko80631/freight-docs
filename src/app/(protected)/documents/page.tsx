'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
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

interface DocumentError {
  message: string;
  code?: string;
}

function DocumentsLoadingState() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [error, setError] = useState<DocumentError | null>(null);
  const { currentTeam, isLoading: isTeamLoading } = useTeamStore();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const fetchDocuments = useCallback(async () => {
    if (!currentTeam?.id) {
      setError({ message: 'No team selected' });
      return;
    }

    setIsLoadingDocs(true);
    setError(null);

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

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setDocuments(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      const documentError: DocumentError = {
        message: error instanceof Error ? error.message : 'Failed to load documents',
        code: error instanceof Error ? (error as any).code : undefined
      };
      setError(documentError);
      toast({
        title: 'Error',
        description: documentError.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingDocs(false);
    }
  }, [currentTeam?.id, isTeamLoading, page, pageSize, filters, supabase, toast]);

  useEffect(() => {
    if (currentTeam?.id && !isTeamLoading) {
      fetchDocuments();
    }
  }, [currentTeam?.id, isTeamLoading, fetchDocuments]);

  const handleViewDocument = (id: string) => {
    if (!id) {
      toast({
        title: 'Error',
        description: 'Invalid document ID',
        variant: 'destructive'
      });
      return;
    }
    router.push(`/documents/${id}`);
  };

  const handleFilterChange = (newFilters: DocumentFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 0) return;
    setPage(newPage);
  };

  // Show loading state while team data is loading
  if (isTeamLoading) {
    return <DocumentsLoadingState />;
  }

  // Show team selection prompt if no team is selected
  if (!currentTeam?.id) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">No Team Selected</h3>
          <p className="text-slate-500 mt-1">
            Please select a team to view documents.
          </p>
          <Button
            onClick={() => router.push('/teams/select')}
            className="mt-4"
          >
            Select Team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage your freight documents
          </p>
        </div>
        <Button 
          onClick={() => router.push('/document-upload')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <DocumentFilters onFilterChange={handleFilterChange} />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">Error Loading Documents</h3>
          <p className="text-red-600 mt-1">{error.message}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => {
              setError(null);
              fetchDocuments();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {isLoadingDocs ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
          ))}
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

      <Toaster />
    </div>
  );
} 