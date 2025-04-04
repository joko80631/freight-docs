'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { safeArray } from '@/lib/array-utils'

interface FreightTableProps<T = any> {
  data?: T[];
  columns?: {
    header: string;
    accessorKey: keyof T;
    cell?: (value: T[keyof T], row: T) => React.ReactNode;
    align?: 'left' | 'right' | 'center';
  }[];
  children?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  showChevron?: boolean;
}

export function FreightTable<T = any>({
  data,
  columns,
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
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-gray-50" data-testid="freight-table-header">
            <tr>
              {safeArray(columns).map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'h-12 px-3 py-2 text-left align-middle font-medium text-gray-500 tracking-wide',
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center',
                    '[&:has([role=checkbox])]:pr-0'
                  )}
                  data-testid={`freight-table-header-cell-${index}`}
                >
                  {column.header}
                </th>
              ))}
              {showChevron && <th className="w-10" data-testid="freight-table-header-chevron" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100" data-testid="freight-table-body">
            {safeArray(data).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'transition-colors hover:bg-gray-50',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
                data-testid={`freight-table-row-${rowIndex}`}
              >
                {safeArray(columns).map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      'px-3 py-2 align-middle text-gray-900',
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center',
                      '[&:has([role=checkbox])]:pr-0'
                    )}
                    data-testid={`freight-table-cell-${rowIndex}-${colIndex}`}
                  >
                    {column.cell
                      ? column.cell(row[column.accessorKey], row)
                      : row[column.accessorKey]?.toString()}
                  </td>
                ))}
                {showChevron && (
                  <td className="w-10 px-3 py-2 text-gray-400" data-testid={`freight-table-chevron-${rowIndex}`}>
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
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-auto rounded-md border border-gray-200', className)} data-testid="freight-table-custom">
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  );
} 