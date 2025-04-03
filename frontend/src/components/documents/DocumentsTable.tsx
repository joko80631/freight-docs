'use client';

import { FreightTable } from '@/components/freight/FreightTable';
import { FreightBadge } from '@/components/freight/FreightBadge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/types/document';
import { 
  getConfidenceVariant, 
  getConfidenceLabel, 
  getStatusVariant,
  getPaginationIndices
} from '@/lib/documents';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { safeArray } from '@/lib/utils';

export interface DocumentsTableProps {
  documents: Document[];
  onDocumentClick: (document: Document) => void;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DocumentsTable({
  documents,
  onDocumentClick,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange
}: DocumentsTableProps) {
  const timeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getConfidencePercent = (confidence: number) => {
    return Math.round(confidence * 100);
  };

  // Calculate pagination
  const totalDocs = safeArray(documents).length;
  const { startIndex, endIndex } = getPaginationIndices(currentPage, pageSize, totalDocs);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage * pageSize >= totalDocs;
  
  // Get paginated documents
  const paginatedDocuments = safeArray(documents).slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
              Document
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
              Type
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
              Confidence
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
              Status
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
              Load
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
              Uploaded
            </th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {safeArray(paginatedDocuments).map((document) => (
            <tr
              key={document.id}
              onClick={() => onDocumentClick(document)}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
            >
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                <button className="text-left font-medium hover:underline">
                  {document.name}
                </button>
              </td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                <FreightBadge variant="info">{document.type}</FreightBadge>
              </td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                <FreightBadge variant={getConfidenceVariant(document.confidence)}>
                  {getConfidencePercent(document.confidence)}%
                </FreightBadge>
              </td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                <FreightBadge variant={getStatusVariant(document.status)}>
                  {document.status}
                </FreightBadge>
              </td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                {document.load_id ? (
                  <FreightBadge variant="success">
                    Load #{document.load?.reference_number || document.load_id}
                  </FreightBadge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-muted-foreground">
                {timeAgo(document.uploaded_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination Controls */}
      {onPageChange && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Showing {startIndex}–{endIndex} of {totalDocs} documents
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              disabled={isFirstPage}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              disabled={isLastPage}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {onPageSizeChange && (
              <select 
                className="rounded-md border border-neutral-300 p-2 text-sm"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 