'use client';

import React from 'react';
import { Document } from '@/types/document';
import { FreightBadge } from '@/components/freight/FreightBadge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { 
  getConfidenceVariant, 
  getConfidenceLabel,
  getPaginationIndices
} from '@/lib/documents';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentsTableProps {
  documents: Document[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onDocumentClick: (document: Document) => void;
}

export function DocumentsTable({
  documents,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onDocumentClick
}: DocumentsTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">No documents found</p>
        <p className="text-sm text-neutral-500 mt-1">
          Try adjusting your filters or upload a new document.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-left font-medium">Name</th>
              <th className="py-3 px-4 text-left font-medium">Type</th>
              <th className="py-3 px-4 text-left font-medium">Confidence</th>
              <th className="py-3 px-4 text-left font-medium">Load</th>
              <th className="py-3 px-4 text-left font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr
                key={document.id}
                className="border-b hover:bg-slate-50 cursor-pointer"
                onClick={() => onDocumentClick(document)}
              >
                <td className="py-3 px-4">{document.name}</td>
                <td className="py-3 px-4">
                  {document.type?.toUpperCase() || 'UNCLASSIFIED'}
                </td>
                <td className="py-3 px-4">
                  <FreightBadge variant={getConfidenceVariant(document.confidence_score || 0)}>
                    {getConfidenceLabel(document.confidence_score || 0)}
                  </FreightBadge>
                </td>
                <td className="py-3 px-4">
                  {document.load_id || 'Not linked'}
                </td>
                <td className="py-3 px-4 text-neutral-500">
                  {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-neutral-500">
            Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} of {totalCount} documents
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 