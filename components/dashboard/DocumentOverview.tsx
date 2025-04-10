'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Document = {
  id: string;
  name: string;
  type: string;
  uploaded_at: string;
  load_id: string;
};

export default function DocumentOverview() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('uploaded_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setDocuments(data || []);

        // Fetch document stats
        const { data: statsData, error: statsError } = await supabase
          .from('documents')
          .select('status', { count: 'exact' });

        if (statsError) throw statsError;

        const stats = {
          total: statsData?.length || 0,
          pending: statsData?.filter((doc) => doc.status === 'pending').length || 0,
          approved: statsData?.filter((doc) => doc.status === 'approved').length || 0,
        };

        setStats(stats);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [supabase]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-600">Total Documents</p>
          <p className="mt-1 text-2xl font-semibold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-yellow-600">Pending Review</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-600">Approved</p>
          <p className="mt-1 text-2xl font-semibold text-green-900">{stats.approved}</p>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-900">Recent Uploads</h4>
          <Link
            href="/documents"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={`/loads/${doc.load_id}/documents/${doc.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 