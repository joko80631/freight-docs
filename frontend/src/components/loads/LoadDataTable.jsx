import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Eye, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';
import { statusColors } from '@/lib/theme';

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    ...statusColors.success,
  },
  pending: {
    label: 'Pending',
    ...statusColors.warning,
  },
  completed: {
    label: 'Completed',
    ...statusColors.info,
  },
  cancelled: {
    label: 'Cancelled',
    ...statusColors.error,
  },
};

export const LoadStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${config.bg} ${config.text} ${config.border}`}>
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

const LoadDataTable = ({ loads, onView, onEdit, onDelete }) => {
  if (!loads?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No loads found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Load ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loads.map((load) => (
            <TableRow key={load.id}>
              <TableCell className="font-medium">{load.id}</TableCell>
              <TableCell>{load.customer_name}</TableCell>
              <TableCell>{load.origin}</TableCell>
              <TableCell>{load.destination}</TableCell>
              <TableCell>
                <LoadStatusBadge status={load.status} />
              </TableCell>
              <TableCell>
                {format(new Date(load.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {load.document_count || 0} / {load.required_documents || 0}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(load)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(load)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(load)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LoadDataTable; 