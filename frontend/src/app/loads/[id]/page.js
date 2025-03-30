'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
      const { data, error } = await supabase
        .from('loads')
        .select(`
          *,
          customer:customers(name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Load not found')
      
      setLoad(data)

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('load_id', id)
        .order('created_at', { ascending: false })

      if (docsError) throw docsError

      setDocuments(docsData || [])
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
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Upload file to user-specific folder
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert([
          {
            load_id: id,
            type: 'pending', // Will be updated after classification
            status: 'processing',
            file_path: fileName,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (docError) throw docError

      // Update local state
      setDocuments(prev => [docData, ...prev])
      toast.success('Document uploaded successfully')

      // Trigger classification (this would be handled by your backend)
      // For now, we'll simulate it
      setTimeout(() => {
        const classifiedDoc = {
          ...docData,
          type: 'BOL',
          status: 'completed',
          classification_confidence: 0.95,
          is_manual_classification: false
        }
        setDocuments(prev => 
          prev.map(doc => doc.id === docData.id ? classifiedDoc : doc)
        )
      }, 2000)
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