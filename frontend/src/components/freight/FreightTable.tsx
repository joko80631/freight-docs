'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (value: string | number, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

interface FreightTableProps<T> {
  data: T[];
  columns?: Column<T>[];
  pagination?: PaginationProps;
  children?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  showChevron?: boolean;
}

export function FreightTable<T>({
  data,
  columns,
  pagination,
  children,
  className,
  onRowClick,
  isLoading,
  emptyState,
  showChevron = false,
}: FreightTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center justify-center" data-testid="freight-table-loading">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!data?.length && emptyState) {
    return <div className="w-full py-8" data-testid="freight-table-empty">{emptyState}</div>;
  }

  if (data && columns) {
    return (
      <div className={cn('w-full overflow-auto rounded-md border border-gray-200', className)} data-testid="freight-table">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={String(column.accessorKey)}
                  className={cn(column.align && `text-${column.align}`)}
                >
                  {column.header}
                </TableHead>
              ))}
              {showChevron && <TableHead className="w-10" data-testid="freight-table-header-chevron" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={cn(
                  'transition-colors hover:bg-gray-50',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
                data-testid={`freight-table-row-${rowIndex}`}
              >
                {columns.map((column) => {
                  const value = row[column.accessorKey];
                  return (
                    <TableCell
                      key={String(column.accessorKey)}
                      className={cn(
                        'px-3 py-2 align-middle text-gray-900',
                        column.align && `text-${column.align}`,
                        '[&:has([role=checkbox])]:pr-0'
                      )}
                      data-testid={`freight-table-cell-${rowIndex}-${String(column.accessorKey)}`}
                    >
                      {column.cell ? column.cell(String(value), row) : String(value)}
                    </TableCell>
                  );
                })}
                {showChevron && (
                  <TableCell className="w-10 px-3 py-2 text-gray-400" data-testid={`freight-table-chevron-${rowIndex}`}>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {pagination && pagination.pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {pagination.page} of {pagination.pageCount}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pageCount}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.pageCount)}
                disabled={pagination.page === pagination.pageCount}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-auto rounded-md border border-gray-200', className)} data-testid="freight-table-custom">
      <Table>
        {children}
      </Table>
    </div>
  );
} 