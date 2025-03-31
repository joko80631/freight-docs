'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Download, Trash2, Loader2, Calendar, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { API_ENDPOINTS } from '@/config/api'
import { getApiHeaders } from '@/utils/api'
import { format } from 'date-fns'

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

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
}

export default function DocumentList({ loadId, onDocumentUpdate }) {
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
      const response = await fetch(API_ENDPOINTS.documents.list, {
        headers: getApiHeaders()
      })
      if (!response.ok) throw new Error('Failed to fetch documents')
      const data = await response.json()
      setDocuments(data.filter(doc => doc.load_id === loadId))
    } catch (error) {
      toast.error('Failed to fetch documents')
      console.error('Error fetching documents:', error)
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

  const handleDownload = async (docId) => {
    try {
      const response = await fetch(API_ENDPOINTS.documents.download(docId), {
        headers: getApiHeaders()
      })
      if (!response.ok) throw new Error('Failed to get download URL')
      const { url } = await response.json()
      window.open(url, '_blank')
    } catch (error) {
      toast.error('Failed to download document')
      console.error('Error downloading document:', error)
    }
  }

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      const response = await fetch(API_ENDPOINTS.documents.delete(docId), {
        method: 'DELETE',
        headers: getApiHeaders()
      })
      if (!response.ok) throw new Error('Failed to delete document')
      setDocuments(prev => prev.filter(doc => doc.id !== docId))
      if (onDocumentUpdate) onDocumentUpdate(null, docId)
      toast.success('Document deleted')
    } catch (error) {
      toast.error('Failed to delete document')
      console.error('Error deleting document:', error)
    }
  }

  const handleStatusChange = async (docId, newStatus) => {
    try {
      const response = await fetch(API_ENDPOINTS.documents.update(docId), {
        method: 'PATCH',
        headers: getApiHeaders(),
        body: JSON.stringify({ status: newStatus })
      })
      if (!response.ok) throw new Error('Failed to update document status')
      const updatedDoc = await response.json()
      setDocuments(prev => prev.map(doc => doc.id === docId ? updatedDoc : doc))
      if (onDocumentUpdate) onDocumentUpdate(updatedDoc)
      toast.success('Document status updated')
    } catch (error) {
      toast.error('Failed to update document status')
      console.error('Error updating document status:', error)
    }
  }

  const handleDueDateChange = async (docId) => {
    try {
      const response = await fetch(API_ENDPOINTS.documents.update(docId), {
        method: 'PATCH',
        headers: getApiHeaders(),
        body: JSON.stringify({ dueDate })
      })
      if (!response.ok) throw new Error('Failed to update document due date')
      const updatedDoc = await response.json()
      setDocuments(prev => prev.map(doc => doc.id === docId ? updatedDoc : doc))
      if (onDocumentUpdate) onDocumentUpdate(updatedDoc)
      setEditingDocId(null)
      setDueDate('')
      toast.success('Document due date updated')
    } catch (error) {
      toast.error('Failed to update document due date')
      console.error('Error updating document due date:', error)
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
                          {STATUS_LABELS[document.status]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {document.confidence ? `${Math.round(document.confidence * 100)}% confidence` : 'Processing...'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(document.inserted_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                      {/* Status Controls */}
                      <div className="flex items-center space-x-2">
                        <select
                          className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          value={document.status}
                          onChange={(e) => handleStatusChange(document.id, e.target.value)}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Due Date Controls */}
                      <div className="flex items-center space-x-2">
                        {editingDocId === document.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="datetime-local"
                              className="text-sm border rounded px-2 py-1"
                              value={dueDate}
                              onChange={(e) => setDueDate(e.target.value)}
                            />
                            <button
                              onClick={() => handleDueDateChange(document.id)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingDocId(null)
                                setDueDate('')
                              }}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              Due: {document.due_date ? format(new Date(document.due_date), 'MMM d, yyyy') : 'Not set'}
                            </span>
                            <button
                              onClick={() => {
                                setEditingDocId(document.id)
                                setDueDate(document.due_date || '')
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Document Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(document.id)}
                          className="text-gray-400 hover:text-gray-500"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(document.id)}
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