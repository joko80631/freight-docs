'use client';

import { useState } from "react";
import { Eye, Pencil, Trash2, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip } from "@/components/ui/tooltip";
import { useToastNotification } from "@/components/shared";
import { Load, formatDate, getRelativeTime, getDocumentCompletionStatus, getMissingDocuments } from "@/lib/mock/loads";

interface LoadsTableProps {
  loads: Load[];
  isLoading?: boolean;
}

type SortField = keyof Load | "documents";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const STATUS_COLORS = {
  Active: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  "On Hold": "bg-yellow-100 text-yellow-800",
  Cancelled: "bg-gray-100 text-gray-800",
} as const;

const STATUS_VARIANTS = {
  Active: "default",
  Completed: "secondary",
  "On Hold": "outline",
  Cancelled: "destructive",
} as const;

const STATUS_RANK = {
  Active: 1,
  "On Hold": 2,
  Completed: 3,
  Cancelled: 4,
} as const;

export function LoadsTable({ loads, isLoading = false }: LoadsTableProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToastNotification();
  const [deleteLoadId, setDeleteLoadId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "dateCreated",
    direction: "desc",
  });

  const handleSort = (field: SortField) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedLoads = [...loads].sort((a, b) => {
    if (sortConfig.field === "documents") {
      const aStatus = getDocumentCompletionStatus(a.documents);
      const bStatus = getDocumentCompletionStatus(b.documents);
      return sortConfig.direction === "asc"
        ? aStatus.percentage - bStatus.percentage
        : bStatus.percentage - aStatus.percentage;
    }

    if (sortConfig.field === "dateCreated") {
      const aDate = new Date(a.dateCreated).getTime();
      const bDate = new Date(b.dateCreated).getTime();
      return sortConfig.direction === "asc"
        ? aDate - bDate
        : bDate - aDate;
    }

    if (sortConfig.field === "status") {
      return sortConfig.direction === "asc"
        ? STATUS_RANK[a.status] - STATUS_RANK[b.status]
        : STATUS_RANK[b.status] - STATUS_RANK[a.status];
    }

    const aValue = a[sortConfig.field as keyof Load];
    const bValue = b[sortConfig.field as keyof Load];

    if (sortConfig.direction === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
  });

  const handleView = (loadId: string) => {
    showSuccess("Coming Soon", "Load details view will be available in the next phase");
  };

  const handleEdit = (loadId: string) => {
    showSuccess("Coming Soon", "Load editing will be available in the next phase");
  };

  const handleDelete = (loadId: string) => {
    setDeleteLoadId(loadId);
  };

  const confirmDelete = () => {
    if (!deleteLoadId) return;
    showSuccess("Load Deleted", "The load has been successfully deleted");
    setDeleteLoadId(null);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-[250px] animate-pulse rounded-md bg-muted" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (loads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold">No loads found</h3>
        <p className="text-sm text-muted-foreground">
          Create your first load to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                className="p-0 hover:bg-transparent"
                onClick={() => handleSort("reference")}
              >
                Reference
                <SortIcon field="reference" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="p-0 hover:bg-transparent"
                onClick={() => handleSort("clientName")}
              >
                Client
                <SortIcon field="clientName" />
              </Button>
            </TableHead>
            <TableHead>Route</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="p-0 hover:bg-transparent"
                onClick={() => handleSort("dateCreated")}
              >
                Created
                <SortIcon field="dateCreated" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="p-0 hover:bg-transparent"
                onClick={() => handleSort("status")}
              >
                Status
                <SortIcon field="status" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="p-0 hover:bg-transparent"
                onClick={() => handleSort("documents")}
              >
                Documents
                <SortIcon field="documents" />
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLoads.map((load) => {
            const docStatus = getDocumentCompletionStatus(load.documents);
            const missingDocs = getMissingDocuments(load.documents);

            return (
              <TableRow key={load.id}>
                <TableCell className="font-medium">
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => handleView(load.id)}
                  >
                    {load.reference}
                  </Button>
                </TableCell>
                <TableCell>{load.clientName}</TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span>{load.origin}</span>
                    <span className="hidden sm:inline">→</span>
                    <span>{load.destination}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Tooltip
                    content={getRelativeTime(load.dateCreated)}
                  >
                    {formatDate(load.dateCreated)}
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={STATUS_VARIANTS[load.status]}
                    className={STATUS_COLORS[load.status]}
                  >
                    {load.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Tooltip
                    content={
                      missingDocs.length > 0 ? (
                        <div className="space-y-1">
                          <p className="font-medium">Missing Documents:</p>
                          <ul className="list-inside list-disc text-sm">
                            {missingDocs.map((doc) => (
                              <li key={doc}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>All documents complete</p>
                      )
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Progress
                        value={docStatus.percentage}
                        className="h-2 w-20"
                      />
                      <span className="text-sm">
                        {docStatus.complete}/{docStatus.total}
                      </span>
                    </div>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(load.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(load.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(load.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteLoadId} onOpenChange={() => setDeleteLoadId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Load</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the load
              and all associated documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 