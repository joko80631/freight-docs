'use client';

import React from 'react';
import Link from 'next/link';
import { useLoadStore } from '@/store/loadStore';
import { useTeamStore } from '@/store/team-store';
import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import type { Load, Database } from '@/types/database';
import { LOAD_STATUS_COLORS, LOAD_STATUS_LABELS, type LoadStatus } from '@/constants/loads';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoadManagement() {
  const { loads, isLoading, fetchLoads } = useLoadStore();
  const { currentTeam } = useTeamStore();
  const [selectedLoads, setSelectedLoads] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (currentTeam?.id) {
      fetchLoads(currentTeam.id);
    }
  }, [currentTeam?.id, fetchLoads]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLoads(loads.map(load => load.id));
    } else {
      setSelectedLoads([]);
    }
  };

  const handleSelectLoad = (loadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLoads(prev => [...prev, loadId]);
    } else {
      setSelectedLoads(prev => prev.filter(id => id !== loadId));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedLoads.length) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('loads')
        .delete()
        .in('id', selectedLoads);

      if (error) throw error;

      toast.success('Selected loads deleted successfully');
      setSelectedLoads([]);
      if (currentTeam?.id) {
        fetchLoads(currentTeam.id);
      }
    } catch (error) {
      console.error('Error deleting loads:', error);
      toast.error('Failed to delete loads');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please select a team to view loads.</p>
      </div>
    );
  }

  if (loads.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No loads found. Create your first load to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={selectedLoads.length === loads.length && loads.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm text-gray-600">
            Select All
          </label>
        </div>
        {selectedLoads.length > 0 && (
          <Button
            variant="outline"
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="text-red-600 hover:bg-red-50"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete Selected
          </Button>
        )}
      </div>

      {/* Load List */}
      <div className="space-y-2">
        {loads.map((load) => (
          <div
            key={load.id}
            className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedLoads.includes(load.id)}
                onCheckedChange={(checked: boolean) => handleSelectLoad(load.id, checked)}
              />
              <div>
                <h3 className="font-medium">{load.load_number}</h3>
                <p className="text-sm text-gray-500">
                  {load.origin} → {load.destination}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  LOAD_STATUS_COLORS[load.status as LoadStatus]
                }`}
              >
                {LOAD_STATUS_LABELS[load.status as LoadStatus]}
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push(`/loads/${load.id}`)}
            >
              View Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 