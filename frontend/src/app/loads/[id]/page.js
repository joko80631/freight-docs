'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { API_ENDPOINTS, getApiHeaders } from '@/config/api'
import toast from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import DocumentList from './components/DocumentList'
import DocumentUpload from './components/DocumentUpload'
import LoadInfo from './components/LoadInfo'
import DocumentStatus from './components/DocumentStatus'
import { ArrowLeft, Loader2, MapPin, Calendar, User, FileText } from 'lucide-react'
import Link from 'next/link'

const DOCUMENT_TYPES = {
  BOL: 'Bill of Lading',
  POD: 'Proof of Delivery',
  INVOICE: 'Invoice'
}

export default function LoadDetailPage() {
  const { id } = useParams()
  const [load, setLoad] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [error, setError] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchLoadDetails()
  }, [id])

  const fetchLoadDetails = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const response = await fetch(API_ENDPOINTS.loads.get(id), {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch load details')
      }

      const data = await response.json()
      setLoad(data)

      // Fetch documents
      const docsResponse = await fetch(API_ENDPOINTS.documents.list, {
        headers: getApiHeaders()
      })

      if (!docsResponse.ok) {
        throw new Error('Failed to fetch documents')
      }

      const docsData = await docsResponse.json()
      setDocuments(docsData.filter(doc => doc.load_id === id))
    } catch (err) {
      console.error('Error fetching load:', err)
      setError(err.message === 'Load not found' ? 'Load not found' : 'Failed to load details')
      toast.error('Failed to load details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentUpload = async (file) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Upload file to user-specific folder
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Create document record
      const response = await fetch(API_ENDPOINTS.documents.upload, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          load_id: id,
          file_path: fileName,
          user_id: user.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create document record')
      }

      const docData = await response.json()
      setDocuments(prev => [docData, ...prev])
      toast.success('Document uploaded successfully')

      // Trigger classification
      const classifyResponse = await fetch(API_ENDPOINTS.documents.classify, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          documentPath: fileName,
          loadId: id
        })
      })

      if (!classifyResponse.ok) {
        throw new Error('Failed to classify document')
      }

      const classifiedDoc = await classifyResponse.json()
      setDocuments(prev => 
        prev.map(doc => doc.id === docData.id ? classifiedDoc : doc)
      )
    } catch (error) {
      toast.error('Failed to upload document')
      console.error('Error uploading document:', error)
    }
  }

  const handleClassificationUpdate = async (documentId, newType, isManual = true) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          type: newType,
          is_manual_classification: isManual
        })
        .eq('id', documentId)

      if (error) throw error

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, type: newType, is_manual_classification: isManual }
            : doc
        )
      )

      toast.success('Document classification updated')
    } catch (error) {
      toast.error('Failed to update classification')
      console.error('Error updating classification:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link
                href="/loads"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Loads
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/loads"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Loads
          </Link>
        </div>

        {/* Load Info Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Load #{load.reference_number}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Created {new Date(load.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {load.customer && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-2" />
                    <span>{load.customer.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Route</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {load.origin} → {load.destination}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-1 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Pickup & Delivery</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(load.pickup_date).toLocaleDateString()} - {new Date(load.delivery_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Upload Documents</h2>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <DocumentUpload
              loadId={id}
              onUploadComplete={fetchLoadDetails}
            />
          </div>
        </div>

        {/* Document List Section */}
        <div className="bg-white rounded-lg shadow">
          <DocumentList 
            documents={documents}
            onClassificationUpdate={handleClassificationUpdate}
          />
        </div>
      </div>
    </div>
  )
} 