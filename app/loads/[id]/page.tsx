'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';
import { LOAD_STATUS_COLORS, LOAD_STATUS_LABELS, type LoadStatus } from '@/src/constants/loads';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { Button } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { loadFormSchema } from '@/src/lib/validations/load';
import type { Database } from '@/src/types/database';

type Load = Database['public']['Tables']['loads']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];

interface Load {
  id: string;
  team_id: string;
  load_number: string;
  status: LoadStatus;
  origin: string;
  destination: string;
  created_at: string;
  updated_at: string | null;
  delivery_date: string;
  notes: string | null;
}

export default function LoadDetailPage() {
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const [load, setLoad] = useState<Load | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Load>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchLoad = async () => {
    if (!params?.id) return;
    try {
      const response = await fetch(`/api/loads/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch load');
      const data = await response.json();
      setLoad(data);
      setFormData(data);

      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('load_id', params.id);

      if (documentsError) throw documentsError;
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching load:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoad();
  }, [params?.id]);

  const handleStatusChange = async (newStatus: LoadStatus) => {
    try {
      const { error } = await supabase
        .from('loads')
        .update({ status: newStatus })
        .eq('id', params.id);

      if (error) throw error;
      setLoad(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loadFormSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path) {
          errors[error.path[0]] = error.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    try {
      const { error } = await supabase
        .from('loads')
        .update(formData)
        .eq('id', params.id);

      if (error) throw error;
      setLoad(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      setFormErrors({});
    } catch (error) {
      console.error('Error updating load:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!load) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Load not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Load Details</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button
            onClick={() => handleSubmit}
            disabled={!isEditing}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FormControl label="Load Number" error={formErrors.load_number}>
            <Input
              value={formData.load_number || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, load_number: e.target.value }))}
              disabled={!isEditing}
            />
          </FormControl>

          <FormControl label="Status" error={formErrors.status}>
            <Select
              value={formData.status || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as LoadStatus }))}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LOAD_STATUS_LABELS).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>

          <FormControl label="Origin" error={formErrors.origin}>
            <Input
              value={formData.origin || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
              disabled={!isEditing}
            />
          </FormControl>

          <FormControl label="Destination" error={formErrors.destination}>
            <Input
              value={formData.destination || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              disabled={!isEditing}
            />
          </FormControl>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Documents</h2>
          <DocumentUpload loadId={load.id} onUploadComplete={fetchLoad} />
          
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{doc.file_name}</p>
                    <p className="text-sm text-gray-500">{doc.type}</p>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No documents uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
} 