import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Edit, 
  MoreVertical, 
  Truck, 
  AlertTriangle,
  FileDown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { validateStatusTransition, getStatusTransitionMessage } from '@/lib/loadValidation';
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import LoadHealthIndicator from './LoadHealthIndicator';
import ChecklistReportExport from './ChecklistReportExport';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const STATUS_VARIANTS = {
  PENDING: 'secondary',
  IN_TRANSIT: 'default',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
};

const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function LoadDetailHeader({
  load,
  onEdit,
  onStatusChange,
  onDelete,
  onBack,
  className,
}) {
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusValidation, setStatusValidation] = useState(null);

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    
    // Validate the status transition
    const validation = validateStatusTransition(load, status);
    setStatusValidation(validation);
    
    if (validation.isValid) {
      // If valid, proceed with status change
      onStatusChange(status);
    } else {
      // If invalid, show confirmation dialog with warning
      setShowStatusConfirm(true);
    }
  };

  const handleStatusConfirm = () => {
    if (selectedStatus) {
      onStatusChange(selectedStatus);
    }
    setShowStatusConfirm(false);
  };

  const handleDeleteClick = () => {
    // For completed loads, show confirmation dialog
    if (load.status === 'DELIVERED') {
      setShowDeleteConfirm(true);
    } else {
      onDelete();
    }
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{load.reference}</h1>
            <p className="text-muted-foreground">{load.client_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChecklistReportExport load={load} />
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(STATUS_LABELS).map(([status, label]) => {
                const validation = validateStatusTransition(load, status);
                const isDisabled = load.status === status || !validation.isValid;
                
                return (
                  <TooltipProvider key={status}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <DropdownMenuItem
                            onClick={() => handleStatusSelect(status)}
                            disabled={isDisabled}
                            className={cn(
                              isDisabled && "cursor-not-allowed"
                            )}
                          >
                            {label}
                          </DropdownMenuItem>
                        </div>
                      </TooltipTrigger>
                      {!validation.isValid && (
                        <TooltipContent>
                          <p>{getStatusTransitionMessage(validation.missingDocuments)}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDeleteClick}
              >
                Delete Load
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{load.origin}</p>
            <p className="text-sm text-muted-foreground">Origin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{load.destination}</p>
            <p className="text-sm text-muted-foreground">Destination</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANTS[load.status]}>
            {STATUS_LABELS[load.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <LoadHealthIndicator load={load} />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div>
          Created {formatDistanceToNow(new Date(load.created_at), { addSuffix: true })}
        </div>
        <div>
          Last updated {formatDistanceToNow(new Date(load.updated_at), { addSuffix: true })}
        </div>
      </div>

      {/* Status Change Confirmation Dialog */}
      <ConfirmationDialog
        open={showStatusConfirm}
        onOpenChange={setShowStatusConfirm}
        title="Missing Required Documents"
        description={statusValidation ? getStatusTransitionMessage(statusValidation.missingDocuments) : ""}
        confirmLabel="Proceed Anyway"
        cancelLabel="Cancel"
        onConfirm={handleStatusConfirm}
        variant="warning"
        icon={<AlertTriangle className="h-5 w-5" />}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Completed Load"
        description="This load is marked as completed. Deleting it will remove all associated documents and history. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        icon={<AlertTriangle className="h-5 w-5" />}
      />
    </div>
  );
} 