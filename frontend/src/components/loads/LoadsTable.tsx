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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToastNotification } from "@/components/shared";
import { Load, formatDate, getRelativeTime, getDocumentCompletionStatus, getMissingDocuments } from "@/lib/mock/loads";
import { safeArray } from "@/lib/array-utils";
import { routes } from '@/config/routes';

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

    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortConfig.direction === "asc" ? 1 : -1;
    if (bValue === undefined) return sortConfig.direction === "asc" ? -1 : 1;

    if (sortConfig.direction === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
  });

  const handleView = (loadId: string) => {
    router.push(routes.loads.detail(loadId));
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
          {safeArray(Array.from({ length: 5 })).map((_, i) => (
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
          {safeArray(sortedLoads).map((load) => {
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
                  <div className="flex items-center gap-1">
                    <span>{formatDate(load.dateCreated)}</span>
                    <span className="text-muted-foreground">
                      ({getRelativeTime(load.dateCreated)})
                    </span>
                  </div>
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={docStatus.percentage}
                            className="w-24"
                          />
                          <span className="text-sm">
                            {docStatus.percentage}%
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {docStatus.complete} of {docStatus.total} documents
                          </p>
                          {missingDocs.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Missing: {missingDocs.join(", ")}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(load.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(load.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(load.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Load</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this load? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmDelete}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 