"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTeamStore } from "@/store/team-store";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Trash2, Link, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { useAuditLog } from "@/hooks/use-audit-log";

interface BatchOperationsToolbarProps {
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  onOptimisticDelete?: (items: string[]) => void;
}

const MAX_BATCH_SIZE = 25;

export function BatchOperationsToolbar({
  selectedItems,
  onSelectionChange,
  onOptimisticDelete,
}: BatchOperationsToolbarProps) {
  const router = useRouter();
  const { currentTeam } = useTeamStore();
  const supabase = createClientComponentClient();
  const { logAction } = useAuditLog();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input or textarea
      const activeElement = document.activeElement;
      if (
        activeElement &&
        ["INPUT", "TEXTAREA"].includes(activeElement.tagName)
      ) {
        return;
      }

      // Only handle shortcuts if we have items selected
      if (selectedItems.length === 0) return;

      // Delete shortcut
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setShowDeleteDialog(true);
      }

      // Link shortcut
      if (e.key === "l" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleLink();
      }

      // Select all shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        // This will be handled by the parent component
      }

      // Clear selection shortcut
      if (e.key === "Escape") {
        e.preventDefault();
        onSelectionChange([]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedItems, onSelectionChange]);

  const handleDelete = async () => {
    if (!currentTeam?.id) return;

    // Check batch size limit
    if (selectedItems.length > MAX_BATCH_SIZE) {
      toast.error(`Please select no more than ${MAX_BATCH_SIZE} documents at a time.`);
      return;
    }

    setIsProcessing(true);

    // Optimistically update UI
    if (onOptimisticDelete) {
      onOptimisticDelete(selectedItems);
    }

    try {
      // Start a transaction
      const { data, error } = await supabase.rpc("batch_delete_documents", {
        p_team_id: currentTeam.id,
        p_document_ids: selectedItems,
      });

      if (error) throw error;

      // Log the delete action
      await logAction({
        action: "batch_delete",
        document_ids: selectedItems,
        metadata: {
          count: selectedItems.length,
        },
      });

      toast.success(`Deleted ${selectedItems.length} document(s)`);

      onSelectionChange([]);
    } catch (error) {
      console.error("Delete error:", error);
      
      // Rollback optimistic update
      if (onOptimisticDelete) {
        onOptimisticDelete([]);
      }

      toast.error("Failed to delete documents. Nothing was changed.");
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  const handleLink = async () => {
    // Check batch size limit
    if (selectedItems.length > MAX_BATCH_SIZE) {
      toast.error(`Please select no more than ${MAX_BATCH_SIZE} documents at a time.`);
      return;
    }

    try {
      // Log the link action before navigation
      await logAction({
        action: "batch_link",
        document_ids: selectedItems,
        metadata: {
          count: selectedItems.length,
        },
      });

      // Navigate to the link dialog with selected items
      router.push(`/documents/link?ids=${selectedItems.join(",")}`);
    } catch (error) {
      console.error("Link error:", error);
      toast.error("Failed to prepare link operation. Please try again.");
    }
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">
              {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLink}
              className="gap-2"
            >
              <Link className="h-4 w-4" />
              Link to Load
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Documents</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.length} document
              {selectedItems.length !== 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 