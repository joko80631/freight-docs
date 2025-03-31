import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { API_ENDPOINTS, getApiHeaders } from '@/config/api';
import DocumentStatusBadge from '@/components/ui/DocumentStatusBadge';
import StatusChangeForm from '@/components/ui/StatusChangeForm';
import StatusHistory from '@/components/ui/StatusHistory';
import DueDatePicker from '@/components/ui/DueDatePicker';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentDetail({ document, onUpdate }) {
  const [isStatusFormOpen, setIsStatusFormOpen] = useState(false);
  const [isDueDatePickerOpen, setIsDueDatePickerOpen] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  // Fetch status history when component mounts
  useState(() => {
    fetchStatusHistory();
  }, [document.id]);

  const fetchStatusHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('document_status_history')
        .select('*')
        .eq('document_id', document.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStatusHistory(data || []);
    } catch (error) {
      console.error('Error fetching status history:', error);
      toast.error('Failed to load status history');
    }
  };

  const handleStatusChange = async ({ status, comment }) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch(API_ENDPOINTS.documents.updateStatus(document.id), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          status,
          comment,
          updated_by: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedDoc = await response.json();
      onUpdate(updatedDoc);
      await fetchStatusHistory();
      toast.success('Document status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update document status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDueDateChange = async (dueDate) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.documents.updateDueDate(document.id), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ due_date: dueDate })
      });

      if (!response.ok) throw new Error('Failed to update due date');

      const updatedDoc = await response.json();
      onUpdate(updatedDoc);
      toast.success('Due date updated successfully');
    } catch (error) {
      console.error('Error updating due date:', error);
      toast.error('Failed to update due date');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Document Header */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {document.type}
            </h3>
          </div>
          <DocumentStatusBadge 
            status={document.status} 
            dueDate={document.due_date}
          />
        </div>
      </div>

      {/* Document Content */}
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document Preview */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Document Preview</h4>
            {/* Add document preview component here */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Document preview placeholder</span>
            </div>
          </div>

          {/* Document Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Document Details</h4>
              <dl className="grid grid-cols-1 gap-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(document.created_at).toLocaleString()}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
                    <dd className="text-sm text-gray-900">{document.uploaded_by}</dd>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                    <dd className="text-sm text-gray-900">
                      {document.due_date 
                        ? new Date(document.due_date).toLocaleString()
                        : 'Not set'}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={() => setIsStatusFormOpen(true)}
                disabled={isLoading}
              >
                Update Status
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDueDatePickerOpen(true)}
                disabled={isLoading}
              >
                Set Due Date
              </Button>
            </div>
          </div>
        </div>

        {/* Status History */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Status History</h4>
          <StatusHistory history={statusHistory} />
        </div>
      </div>

      {/* Modals */}
      <StatusChangeForm
        isOpen={isStatusFormOpen}
        onClose={() => setIsStatusFormOpen(false)}
        onSubmit={handleStatusChange}
        currentStatus={document.status}
        documentType={document.type}
      />

      <DueDatePicker
        isOpen={isDueDatePickerOpen}
        onClose={() => setIsDueDatePickerOpen(false)}
        onSubmit={handleDueDateChange}
        currentDueDate={document.due_date}
      />
    </div>
  );
} 