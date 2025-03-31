'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Download, Trash2, Loader2, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const REQUIRED_DOCUMENTS = ['POD', 'BOL', 'Invoice']

const DOCUMENT_TYPE_COLORS = {
  POD: 'bg-green-100 text-green-800',
  BOL: 'bg-blue-100 text-blue-800',
  Invoice: 'bg-yellow-100 text-yellow-800',
  default: 'bg-gray-100 text-gray-800'
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

export default function DocumentList({ loadId }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingDocId, setEditingDocId] = useState(null)
  const [dueDate, setDueDate] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchDocuments()
  }, [loadId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('load_id', loadId)
        .order('inserted_at', { ascending: false })

      if (error) throw error
      setDocuments(data)
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError('Failed to load documents')
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const getDocumentTypeColor = (type) => {
    return DOCUMENT_TYPE_COLORS[type] || DOCUMENT_TYPE_COLORS.default
  }

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
  }

  const getMissingDocuments = () => {
    const uploadedTypes = documents.map(doc => doc.document_type)
    return REQUIRED_DOCUMENTS.filter(type => !uploadedTypes.includes(type))
  }

  const handleDownload = async (document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.path, 60)

      if (error) throw error

      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = data.signedUrl
      link.download = document.original_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error downloading document:', err)
      toast.error('Failed to download document')
    }
  }

  const handleDelete = async (document) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id)

      if (dbError) throw dbError

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== document.id))
      toast.success('Document deleted successfully')
    } catch (err) {
      console.error('Error deleting document:', err)
      toast.error('Failed to delete document')
    }
  }

  const handleStatusChange = async (documentId, newStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('documents')
        .update({
          status: newStatus,
          status_updated_by: user.id,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (error) throw error

      // Update local state
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, status: newStatus, status_updated_by: user.id, status_updated_at: new Date().toISOString() }
            : doc
        )
      )

      toast.success(`Document status updated to ${newStatus}`)
    } catch (err) {
      console.error('Error updating document status:', err)
      toast.error('Failed to update document status')
    }
  }

  const handleDueDateChange = (documentId, date) => {
    setEditingDocId(documentId)
    setDueDate(date || '')
  }

  const saveDueDate = async (documentId) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ due_date: dueDate || null })
        .eq('id', documentId)

      if (error) throw error

      // Update local state
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, due_date: dueDate || null }
            : doc
        )
      )

      setEditingDocId(null)
      toast.success('Document due date updated')
    } catch (err) {
      console.error('Error updating document due date:', err)
      toast.error('Failed to update document due date')
    }
  }

  const isDueDatePassed = (date) => {
    if (!date) return false
    const dueDate = new Date(date)
    const today = new Date()
    return dueDate < today
  }

  const formatDueDate = (date) => {
    if (!date) return 'Not set'
    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        {error}
      </div>
    )
  }

  const missingDocuments = getMissingDocuments()

  return (
    <div className="space-y-6">
      {/* Required Documents Status */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-2">Required Documents Status</h3>
        {missingDocuments.length === 0 ? (
          <p className="text-green-600 flex items-center">
            <span className="mr-2">✅</span>
            All required documents uploaded
          </p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Missing documents:</p>
            <div className="flex flex-wrap gap-2">
              {missingDocuments.map(type => (
                <span
                  key={type}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium">Uploaded Documents</h3>
        </div>
        <div className="border-t border-gray-200">
          {documents.length === 0 ? (
            <div className="px-4 py-5 text-center text-gray-500">
              No documents uploaded yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {documents.map((document) => (
                <li key={document.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {document.original_name}
                      </p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(document.document_type)}`}>
                          {document.document_type || 'Unclassified'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {document.status || 'pending'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {document.confidence ? `${Math.round(document.confidence * 100)}% confidence` : 'Processing...'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(document.inserted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                      {/* Status Controls */}
                      <div className="flex items-center space-x-2">
                        <select
                          className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          value={document.status || 'pending'}
                          onChange={(e) => handleStatusChange(document.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      {/* Due Date Controls */}
                      <div className="flex items-center space-x-2">
                        {editingDocId === document.id ? (
                          <>
                            <input
                              type="date"
                              className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              value={dueDate}
                              onChange={(e) => setDueDate(e.target.value)}
                            />
                            <button
                              type="button"
                              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={() => saveDueDate(document.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              onClick={() => setEditingDocId(null)}
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className={`inline-flex items-center space-x-1 text-sm ${
                              isDueDatePassed(document.due_date) ? 'text-red-600' : 'text-gray-500'
                            }`}
                            onClick={() => handleDueDateChange(document.id, document.due_date)}
                          >
                            <Calendar className="h-4 w-4" />
                            <span>{formatDueDate(document.due_date)}</span>
                            {isDueDatePassed(document.due_date) && (
                              <span className="text-red-600">(Overdue)</span>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Document Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(document)}
                          className="text-gray-400 hover:text-gray-500"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(document)}
                          className="text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
} 