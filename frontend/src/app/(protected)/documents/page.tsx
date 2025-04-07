'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/ui/empty-state';
import { DocumentsGrid } from '@/components/documents/DocumentsGrid';
import { useToast } from '@/components/ui/use-toast';
import { Document } from '@/types/document';
import { DocumentUpload } from '@/components/documents/DocumentUpload';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [confidenceFilter, setConfidenceFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (currentTeam?.id) {
      fetchDocuments();
    }
  }, [currentTeam?.id, currentPage, typeFilter, confidenceFilter, searchQuery]);

  const fetchDocuments = async () => {
    if (!currentTeam?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('documents')
        .select('*, loads(id, reference_number)', { count: 'exact' })
        .eq('team_id', currentTeam.id)
        .order('uploaded_at', { ascending: false });

      if (typeFilter) {
        query = query.eq('type', typeFilter);
      }

      if (confidenceFilter !== null) {
        query = query.gte('confidence_score', confidenceFilter);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, count, error } = await query
        .range((currentPage - 1) * 10, currentPage * 10 - 1);

      if (error) throw error;

      setDocuments(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentClick = (document: Document) => {
    router.push(`/documents/${document.id}`);
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    fetchDocuments();
    toast({
      title: 'Success',
      description: 'Document uploaded successfully'
    });
  };

  return (
    <PageContainer
      title="Documents"
      description="Upload and manage your freight documents"
      isLoading={isLoading}
      error={error}
      isEmpty={!isLoading && documents.length === 0}
      emptyState={
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Upload your first document to get started"
          action={{
            label: "Upload Document",
            onClick: () => setShowUploadModal(true)
          }}
        />
      }
      headerAction={
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      }
    >
      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white min-w-[150px]"
                >
                  <option value="">All Types</option>
                  <option value="bill_of_lading">Bill of Lading</option>
                  <option value="invoice">Invoice</option>
                  <option value="proof_of_delivery">Proof of Delivery</option>
                  <option value="rate_confirmation">Rate Confirmation</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <div className="relative">
                <select
                  value={confidenceFilter === null ? '' : confidenceFilter}
                  onChange={(e) => setConfidenceFilter(e.target.value ? Number(e.target.value) : null)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white min-w-[150px]"
                >
                  <option value="">All Confidence</option>
                  <option value="0.9">High (90%+)</option>
                  <option value="0.7">Medium (70%+)</option>
                  <option value="0.5">Low (50%+)</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
          </div>
        </div>
        <DocumentsGrid
          documents={documents}
          totalCount={totalCount}
          page={currentPage - 1}
          pageSize={10}
          onPageChange={(page) => setCurrentPage(page + 1)}
          onDocumentClick={handleDocumentClick}
        />
      </Card>

      {showUploadModal && (
        <DocumentUpload
          open={showUploadModal}
          onOpenChange={setShowUploadModal}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </PageContainer>
  );
} 