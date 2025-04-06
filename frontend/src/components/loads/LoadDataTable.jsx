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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Load ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Origin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Created At
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-300">
          {loads.map((load) => (
            <tr
              key={load.id}
              onClick={() => onView(load)}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                {load.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <LoadStatusBadge status={load.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                {load.origin}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                {load.destination}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(load.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoadDataTable; 