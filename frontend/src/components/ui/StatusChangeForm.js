import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'APPROVED', label: 'Approve' },
  { value: 'REJECTED', label: 'Reject' },
  { value: 'NEEDS_CLARIFICATION', label: 'Request Clarification' },
  { value: 'EXPIRED', label: 'Mark as Expired' }
];

const REQUIRED_COMMENT_STATUSES = ['REJECTED', 'NEEDS_CLARIFICATION'];

export default function StatusChangeForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentStatus,
  documentType 
}) {
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (REQUIRED_COMMENT_STATUSES.includes(status) && !comment.trim()) {
      setError('Please provide a reason for this status change');
      return;
    }

    onSubmit({ status, comment: comment.trim() });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-lg font-medium">
              Update Document Status
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">Select a status</option>
                {STATUS_OPTIONS
                  .filter(option => option.value !== currentStatus)
                  .map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>

            {REQUIRED_COMMENT_STATUSES.includes(status) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Change
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                  placeholder={`Please explain why this ${documentType} needs to be ${status.toLowerCase()}...`}
                  required
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
} 