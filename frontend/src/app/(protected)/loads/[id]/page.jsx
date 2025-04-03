'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/teamStore';
import { useToast } from "@/components/ui/use-toast";
import { TableSkeleton } from "@/components/ui/skeleton";
import LoadDetailHeader from '@/components/loads/LoadDetailHeader';
import DocumentChecklist from '@/components/loads/DocumentChecklist';
import LoadTimeline from '@/components/loads/LoadTimeline';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
import LinkToLoadModal from '@/components/documents/LinkToLoadModal';
import { validateStatusTransition, getStatusTransitionMessage } from '@/lib/loadValidation';
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function LoadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();
  const { toast } = useToast();
  const [load, setLoad] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchLoad = async () => {
      if (!currentTeam?.id || !params.id) return;

      try {
        // Fetch load details
        const { data: loadData, error: loadError } = await supabase
          .from('loads')
          .select(`
            *,
            documents (
              id,
              type,
              status,
              file_url,
              file_name,
              confidence_score,
              uploaded_by,
              created_at
            )
          `)
          .eq('id', params.id)
          .eq('team_id', currentTeam.id)
          .single();

        if (loadError) throw loadError;

        // Fetch timeline events
        const { data: events, error: eventsError } = await supabase
          .from('load_events')
          .select('*')
          .eq('load_id', params.id)
          .order('created_at', { ascending: false });

        if (eventsError) throw eventsError;

        setLoad(loadData);
        setTimelineEvents(events || []);
      } catch (err) {
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load load details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoad();
  }, [params.id, currentTeam?.id, supabase, toast]);

  const handleStatusChange = async (newStatus) => {
    try {
      // Validate status transition
      const validation = validateStatusTransition(load, newStatus);
      
      if (!validation.isValid) {
        // Log the attempted invalid transition for audit purposes
        await supabase
          .from('load_events')
          .insert({
            load_id: load.id,
            type: 'alert',
            description: `Invalid status transition attempted: ${load.status} → ${newStatus}`,
            metadata: {
              missing_documents: validation.missingDocuments,
              reason: getStatusTransitionMessage(validation.missingDocuments),
            },
          });
      }
      
      // Update load status
      const { data, error } = await supabase
        .from('loads')
        .update({ status: newStatus })
        .eq('id', load.id)
        .select()
        .single();

      if (error) throw error;

      // Create status change event
      await supabase
        .from('load_events')
        .insert({
          load_id: load.id,
          type: 'status',
          description: `Status changed from ${load.status} to ${newStatus}`,
          metadata: {
            previous_status: load.status,
            new_status: newStatus,
          },
        });

      setLoad(data);
      toast({
        title: "Success",
        description: "Load status updated successfully",
      });
      
      // Refresh timeline events
      const { data: events } = await supabase
        .from('load_events')
        .select('*')
        .eq('load_id', load.id)
        .order('created_at', { ascending: false });
        
      setTimelineEvents(events || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update load status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!load?.id) return;

    try {
      // Create deletion event before deleting
      await supabase
        .from('load_events')
        .insert({
          load_id: load.id,
          type: 'alert',
          description: `Load deleted`,
          metadata: {
            load_reference: load.reference,
            load_status: load.status,
          },
        });

      const { error } = await supabase
        .from('loads')
        .delete()
        .eq('id', load.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Load deleted successfully",
      });
      router.push('/loads');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete load",
        variant: "destructive",
      });
    }
  };

  const handleDocumentUpload = (type) => {
    setSelectedDocumentType(type);
    setShowUploadModal(true);
  };

  const handleDocumentView = (type) => {
    const document = load.documents.find(doc => doc.type === type);
    if (document) {
      window.open(document.file_url, '_blank');
    }
  };

  const handleDocumentReplace = (type) => {
    setSelectedDocumentType(type);
    setShowUploadModal(true);
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Error loading load details: {error}
        </div>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          Load not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <LoadDetailHeader
        load={load}
        onEdit={() => router.push(`/loads/${load.id}/edit`)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onBack={() => router.push('/loads')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentChecklist
          load={load}
          onUpload={handleDocumentUpload}
          onView={handleDocumentView}
          onReplace={handleDocumentReplace}
        />
        <LoadTimeline events={timelineEvents} />
      </div>

      <DocumentUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        documentType={selectedDocumentType}
        loadId={load.id}
        onUploadComplete={() => {
          setShowUploadModal(false);
          // Refresh load data
          window.location.reload();
        }}
      />

      <LinkToLoadModal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        loadId={load.id}
        onLinkComplete={() => {
          setShowLinkModal(false);
          // Refresh load data
          window.location.reload();
        }}
      />
    </div>
  );
} 