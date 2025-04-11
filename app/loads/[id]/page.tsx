'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';
import { LOAD_STATUS_COLORS, LOAD_STATUS_LABELS, type LoadStatus } from '@/constants/loads';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { Button } from '@/components/ui/button';
// import { FormControl } from '@/components/ui/form-control';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { loadFormSchema } from '@/lib/validations/load';
// import { LoadCompletionStatus } from '@/components/loads/LoadCompletionStatus';
// import { LoadDocumentList } from '@/components/loads/LoadDocumentList';
import type { Database } from '@/types/database';

type Load = Database['public']['Tables']['loads']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];

interface LoadFormData extends Omit<Load, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  created_at?: string;
  updated_at?: string | null;
}

export default function LoadDetailPage() {
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const [load, setLoad] = useState<Load | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<LoadFormData>({} as LoadFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchLoad = useCallback(async () => {
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
  }, [params?.id, supabase]);

  useEffect(() => {
    fetchLoad();
  }, [fetchLoad]);

  const handleStatusChange = async (newStatus: LoadStatus) => {
    if (!load?.id) return;
    try {
      const { error } = await supabase
        .from('loads')
        .update({ status: newStatus })
        .eq('id', load.id);

      if (error) throw error;
      // Using type assertion to avoid type mismatch
      setLoad(prev => prev ? { ...prev, status: newStatus as any } : null);
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

    if (!load?.id) return;

    try {
      const { error } = await supabase
        .from('loads')
        .update(formData)
        .eq('id', load.id);

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
            onClick={handleSubmit}
            disabled={!isEditing}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Replaced FormControl with simple div structure */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Load Number</label>
                  <Input
                    value={formData.load_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, load_number: e.target.value }))}
                    disabled={!isEditing}
                  />
                  {formErrors.load_number && (
                    <p className="text-sm text-red-500">{formErrors.load_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Input
                    value={formData.status || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    disabled={!isEditing}
                    placeholder="Enter status"
                  />
                  {formErrors.status && (
                    <p className="text-sm text-red-500">{formErrors.status}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Origin</label>
                  <Input
                    value={formData.origin || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                    disabled={!isEditing}
                  />
                  {formErrors.origin && (
                    <p className="text-sm text-red-500">{formErrors.origin}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <Input
                    value={formData.destination || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    disabled={!isEditing}
                  />
                  {formErrors.destination && (
                    <p className="text-sm text-red-500">{formErrors.destination}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commented out LoadDocumentList */}
          <div className="p-4 border rounded-md">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            <p className="text-gray-500">Document list functionality temporarily disabled.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Commented out LoadCompletionStatus */}
          <div className="p-4 border rounded-md">
            <h2 className="text-lg font-semibold mb-4">Completion Status</h2>
            <p className="text-gray-500">Completion status functionality temporarily disabled.</p>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
              {/* Temporarily disabled DocumentUpload component */}
              <div className="p-4 border rounded-md">
                <p className="text-gray-500">Document upload functionality temporarily disabled.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 