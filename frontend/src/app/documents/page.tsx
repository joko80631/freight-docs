'use client';

import { useState, useMemo } from 'react';
import { Layout } from '@/components/freight/Layout';
import { DocumentsTable } from '@/components/documents/DocumentsTable';
import { EmptyState } from '@/components/documents/EmptyState';
import { DocumentDetails } from '@/components/documents/DocumentDetails';
import { DocumentPreview } from '@/components/documents/DocumentPreview';
import { UploadModal } from '@/components/documents/UploadModal';
import { Button } from '@/components/ui/button';
import { UploadIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { Document } from '@/types/document';
import { createMockDocument } from '@/lib/documents';

// Mock data for development
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Bill of Lading #12345.pdf',
    type: 'Bill of Lading',
    confidence: 0.95,
    status: 'processed',
    loadId: 'LOAD-123',
    uploadedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Invoice #67890.pdf',
    type: 'Invoice',
    confidence: 0.85,
    status: 'processing',
    uploadedAt: '2024-03-15T11:00:00Z',
  },
  {
    id: '3',
    name: 'Proof of Delivery #54321.jpg',
    type: 'Proof of Delivery',
    confidence: 0.92,
    status: 'processed',
    loadId: 'LOAD-456',
    uploadedAt: '2024-03-14T15:30:00Z',
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter documents based on search and filters
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Search query filter
      if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Document type filter
      if (documentTypeFilter && doc.type !== documentTypeFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter && doc.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [documents, searchQuery, documentTypeFilter, statusFilter]);

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
  };

  const handleDownload = (id: string) => {
    // TODO: Implement actual download functionality
    console.log('Downloading document:', id);
  };

  const handleUploadComplete = (file: File, type: string, loadId: string | undefined) => {
    // Create a new document with the uploaded file info
    const newDocument = createMockDocument({
      name: file.name,
      type: type || 'Unknown',
      loadId,
      status: 'processing',
      confidence: 0.7,
    });
    
    // Add the new document to the list
    setDocuments(prev => [newDocument, ...prev]);
    
    // Close the modal
    setIsUploadModalOpen(false);
  };

  return (
    <Layout>
      <Layout.Header>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Documents</h1>
          <Button onClick={handleUpload}>
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </Layout.Header>

      <Layout.Content>
        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full rounded-md border border-neutral-300 pl-10 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-neutral-200 rounded-md">
              <div>
                <label className="block text-sm font-medium mb-1">Document Type</label>
                <select
                  className="w-full rounded-md border border-neutral-300 p-2"
                  value={documentTypeFilter}
                  onChange={(e) => setDocumentTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Bill of Lading">Bill of Lading</option>
                  <option value="Proof of Delivery">Proof of Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full rounded-md border border-neutral-300 p-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="processed">Processed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {filteredDocuments.length === 0 ? (
          <EmptyState onUpload={handleUpload} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <DocumentsTable
                documents={filteredDocuments}
                onDocumentClick={handleDocumentClick}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
            <div>
              {selectedDocument ? (
                <>
                  <DocumentDetails
                    document={selectedDocument}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                  />
                  <div className="mt-6">
                    <DocumentPreview document={selectedDocument} />
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-500">
                  Select a document to view details
                </div>
              )}
            </div>
          </div>
        )}
      </Layout.Content>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadComplete}
      />
    </Layout>
  );
} 