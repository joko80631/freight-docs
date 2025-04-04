'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { FreightCard } from '@/components/freight/FreightCard';
import { FreightButton } from '@/components/freight/FreightButton';
import { Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Load {
  id: string;
  load_number: string;
  carrier_name: string;
}

export default function UploadPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoadingLoads, setIsLoadingLoads] = useState(true);
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();

  useEffect(() => {
    async function fetchLoads() {
      if (!currentTeam?.id) return;

      try {
        const { data, error } = await supabase
          .from('loads')
          .select('id, load_number, carrier_name')
          .eq('team_id', currentTeam.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLoads(data || []);
      } catch (err) {
        toast.error('Failed to load available loads');
        console.error('Error fetching loads:', err);
        setLoads([]);
      } finally {
        setIsLoadingLoads(false);
      }
    }

    fetchLoads();
  }, [currentTeam?.id, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const loadId = formData.get('load_id') as string;

    if (!file) {
      toast.error('Please select a file');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      toast.success('File uploaded successfully');
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6" data-testid="upload-page" data-debug="layout">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" data-testid="upload-header">
        <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
      </div>

      <FreightCard>
        <form onSubmit={handleSubmit} className="space-y-6 p-6" data-testid="upload-form">
          <div className="space-y-4">
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2" data-testid="upload-file-label">
                Select Document
              </label>
              <input
                type="file"
                id="file"
                name="file"
                accept=".pdf,.txt"
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
                data-testid="upload-file-input"
              />
              <p className="mt-1 text-sm text-gray-500" data-testid="upload-file-help">
                Supported formats: PDF, TXT (max 10MB)
              </p>
            </div>

            <div>
              <label htmlFor="load_id" className="block text-sm font-medium text-gray-700 mb-2" data-testid="upload-load-label">
                Associated Load (Optional)
              </label>
              <select
                id="load_id"
                name="load_id"
                className="w-full border border-gray-300 p-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingLoads || isSubmitting}
                data-testid="upload-load-select"
              >
                <option value="">Select a load...</option>
                {isLoadingLoads ? (
                  <option value="" disabled>Loading loads...</option>
                ) : loads.length === 0 ? (
                  <option value="" disabled>No loads available</option>
                ) : (
                  loads.map(load => (
                    <option key={load.id} value={load.id}>
                      {load.load_number} – {load.carrier_name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <FreightButton
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            data-testid="upload-submit-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </FreightButton>
        </form>
      </FreightCard>
    </div>
  );
} 