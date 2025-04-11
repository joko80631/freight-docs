'use client';

import React from 'react';
import Link from 'next/link';
import { useLoadStore } from '@/store/loadStore';
import { useTeamStore } from '@/store/team-store';
import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import type { Load } from '@/src/types/database';
import { LOAD_STATUS_COLORS, LOAD_STATUS_LABELS, type LoadStatus } from '@/constants/loads';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/src/types/database';

export default function LoadManagement() {
  const { loads, isLoading, fetchLoads } = useLoadStore();
  const { currentTeam } = useTeamStore();
  const [selectedLoads, setSelectedLoads] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (currentTeam?.id) {
      fetchLoads(currentTeam.id);
    }
  }, [currentTeam?.id, fetchLoads]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLoads(new Set(loads.map(load => load.id)));
    } else {
      setSelectedLoads(new Set());
    }
  };

  const handleSelectLoad = (loadId: string, checked: boolean) => {
    const newSelected = new Set(selectedLoads);
    if (checked) {
      newSelected.add(loadId);
    } else {
      newSelected.delete(loadId);
    }
    setSelectedLoads(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedLoads.size === 0) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('loads')
        .delete()
        .in('id', Array.from(selectedLoads));

      if (error) throw error;

      // Refresh loads and clear selection
      if (currentTeam?.id) {
        fetchLoads(currentTeam.id);
      }
      setSelectedLoads(new Set());
    } catch (error) {
      console.error('Error deleting loads:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
      {selectedLoads.size > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <span className="text-sm text-gray-700">
            {selectedLoads.size} load{selectedLoads.size === 1 ? '' : 's'} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="ml-2">Delete Selected</span>
          </Button>
        </div>
      )}

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                <Checkbox
                  checked={selectedLoads.size === loads.length}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                Load Number
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Origin
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Destination
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Date
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loads.map((load: Load) => (
              <tr key={load.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                  <Checkbox
                    checked={selectedLoads.has(load.id)}
                    onCheckedChange={(checked) => handleSelectLoad(load.id, checked as boolean)}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                  <Link
                    href={`/loads/${load.id}`}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {load.load_number}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      LOAD_STATUS_COLORS[load.status as LoadStatus] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {LOAD_STATUS_LABELS[load.status as LoadStatus] || load.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {load.origin}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {load.destination}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(load.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-500"
                      onClick={() => {/* Handle edit */}}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-500"
                      onClick={() => {/* Handle delete */}}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 