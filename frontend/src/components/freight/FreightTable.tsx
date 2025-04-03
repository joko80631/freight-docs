'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, safeArray } from "@/lib/utils"

interface FreightTableProps<T = any> {
  data?: T[];
  columns?: {
    header: string;
    accessorKey: keyof T;
    cell?: (value: T[keyof T], row: T) => React.ReactNode;
  }[];
  children?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export function FreightTable<T = any>({
  data,
  columns,
  children,
  className,
  onRowClick,
  isLoading,
  emptyState,
}: FreightTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">Loading...</div>
      </div>
    )
  }

  if (!data?.length && emptyState) {
    return <div className="w-full py-8">{emptyState}</div>
  }

  if (data && columns) {
    return (
      <div className={cn('w-full overflow-auto', className)}>
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {safeArray(columns).map((column, index) => (
                <th
                  key={index}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {safeArray(data).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                {safeArray(columns).map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                  >
                    {column.cell
                      ? column.cell(row[column.accessorKey], row)
                      : row[column.accessorKey]?.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  );
} 