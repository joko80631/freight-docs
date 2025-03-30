'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'

const DOCUMENT_TYPES = {
  BOL: 'Bill of Lading',
  POD: 'Proof of Delivery',
  INVOICE: 'Invoice'
}

export default function DocumentList({ documents, onClassificationUpdate }) {
  const [sortBy, setSortBy] = useState('created_at')
  const [filterType, setFilterType] = useState('all')
  const supabase = createClientComponentClient()

  const handleDelete = async (documentId) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      toast.success('Document deleted successfully')
    } catch (error) {
      toast.error('Failed to delete document')
      console.error('Error deleting document:', error)
    }
  }

  const handleDownload = async (document) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Verify user has access to the document
      if (document.user_id !== user.id) {
        throw new Error('You do not have permission to download this document')
      }

      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path)

      if (error) throw error

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = document.file_path.split('/').pop()
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Document downloaded successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to download document')
      console.error('Error downloading document:', error)
    }
  }

  const filteredDocuments = documents
    .filter(doc => filterType === 'all' || doc.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.created_at) - new Date(a.created_at)
      }
      return a[sortBy].localeCompare(b[sortBy])
    })

  return (
    <div className="bg-white border border-primary rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-primary rounded px-2 py-1"
          >
            <option value="created_at">Sort by Date</option>
            <option value="type">Sort by Type</option>
            <option value="status">Sort by Status</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-primary rounded px-2 py-1"
          >
            <option value="all">All Types</option>
            {Object.entries(DOCUMENT_TYPES).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {DOCUMENT_TYPES[doc.type] || 'Unclassified'}
                  </span>
                  {doc.is_manual_classification && (
                    <span className="text-xs text-blue-600">(Manual)</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownload(doc)}
                className="p-2 text-gray-600 hover:text-primary"
                title="Download"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>

              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 text-gray-600 hover:text-red-600"
                title="Delete"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No documents found
          </div>
        )}
      </div>
    </div>
  )
} 