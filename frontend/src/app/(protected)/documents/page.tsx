'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from './components/DocumentList';
import { DocumentFilters } from './components/DocumentFilters';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Search, Filter, Upload, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Card, CardContent } from '@/components/ui/card';
import { FreightBadge } from '@/components/freight/FreightBadge';
import { FreightButton } from '@/components/freight/FreightButton';
import { EmptyState } from '@/components/freight/EmptyState';
import { MotionCard } from '@/components/freight/MotionCard';
import { ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Load {
  id: string;
  reference_number: string;
}

interface Document {
  id: string;
  name: string;
  storage_path: string;
  type: 'bol' | 'pod' | 'invoice' | 'other';
  confidence_score: number;
  uploaded_at: string;
  loads?: Load[];
}

interface DocumentFiltersType {
  type?: Document['type'];
  confidence?: number;
}

export default function DocumentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState<DocumentFiltersType>({});
  const { currentTeam } = useTeamStore();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<Document['type'] | ''>('');
  const [confidenceFilter, setConfidenceFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchDocuments = async () => {
    if (!currentTeam?.id) return;
    
    setIsLoading(true);
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
      setTotalPages(Math.ceil((count || 0) / 10));
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
  }, [currentTeam?.id, currentPage, typeFilter, confidenceFilter, searchQuery]);
  
  const handleViewDocument = (id: string) => {
    router.push(`/documents/${id}`);
  };
  
  const handleFilterChange = (newFilters: DocumentFiltersType) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const handleUploadComplete = () => {
    setShowUploadModal(false);
    fetchDocuments();
    toast({
      title: 'Upload Complete',
      description: 'Your document has been uploaded and classified.'
    });
  };
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };
  
  const getConfidenceVariant = (confidence: number) => {
    if (confidence >= 0.85) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6" data-testid="documents-page" data-debug="layout">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" data-testid="documents-header">
        <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
              data-testid="documents-search"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as Document['type'] | '')}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white"
                data-testid="documents-type-filter"
              >
                <option value="">All Types</option>
                <option value="bol">BOL</option>
                <option value="pod">POD</option>
                <option value="invoice">Invoice</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="relative">
              <select
                value={confidenceFilter?.toString() || ''}
                onChange={(e) => setConfidenceFilter(e.target.value ? Number(e.target.value) : null)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white"
                data-testid="documents-confidence-filter"
              >
                <option value="">Any Confidence</option>
                <option value="0.85">High (85%+)</option>
                <option value="0.6">Medium (60%+)</option>
                <option value="0">Low (All)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : documents.length === 0 ? (
            <div className="col-span-full">
              <EmptyState 
                title="No documents found"
                description="Upload your first document to get started."
                action={{
                  label: "Upload Document",
                  onClick: () => setShowUploadModal(true)
                }}
              />
            </div>
          ) : (
            documents.map((doc) => (
              <MotionCard key={doc.id} delay={0.1}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium line-clamp-1">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <FreightBadge variant={getConfidenceVariant(doc.confidence_score)}>
                      {Math.round(doc.confidence_score * 100)}% AI Confidence
                    </FreightBadge>
                    <FreightBadge variant="neutral">
                      {doc.type}
                    </FreightBadge>
                    {doc.loads?.[0] && (
                      <FreightBadge variant="success">
                        Load #{doc.loads[0].reference_number}
                      </FreightBadge>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(doc.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </MotionCard>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6" data-testid="documents-pagination">
          <FreightButton
            variant="secondary"
            size="small"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            data-testid="documents-pagination-first"
          >
            First
          </FreightButton>
          <FreightButton
            variant="secondary"
            size="small"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            data-testid="documents-pagination-prev"
          >
            Previous
          </FreightButton>
          {getPageNumbers().map((page) => (
            <FreightButton
              key={page}
              variant={currentPage === page ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setCurrentPage(page)}
              data-testid={`documents-pagination-page-${page}`}
            >
              {page}
            </FreightButton>
          ))}
          <FreightButton
            variant="secondary"
            size="small"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            data-testid="documents-pagination-next"
          >
            Next
          </FreightButton>
          <FreightButton
            variant="secondary"
            size="small"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            data-testid="documents-pagination-last"
          >
            Last
          </FreightButton>
        </div>
      )}
      
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
            <DocumentUpload 
              onUpload={handleUploadComplete}
              isUploading={false}
              progress={0}
            />
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