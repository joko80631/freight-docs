import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Calendar } from 'lucide-react';

export default function DueDatePicker({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentDueDate,
  className = '' 
}) {
  const [dueDate, setDueDate] = useState(currentDueDate || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    const selectedDate = new Date(dueDate);
    const now = new Date();

    if (selectedDate < now) {
      setError('Due date cannot be in the past');
      return;
    }

    onSubmit(dueDate);
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
              Set Document Due Date
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
                Due Date
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 pl-10"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Select when this document needs to be reviewed by
              </p>
            </div>

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
                Set Due Date
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
} 