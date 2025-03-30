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
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchLoadDetails()
  }, [id])

  async function fetchLoadDetails() {
    try {
      // Fetch load details
      const { data: loadData, error: loadError } = await supabase
        .from('loads')
        .select('*')
        .eq('id', id)
        .single()

      if (loadError) throw loadError

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('load_id', id)
        .order('created_at', { ascending: false })

      if (docsError) throw docsError

      setLoad(loadData)
      setDocuments(docsData || [])
    } catch (error) {
      toast.error('Failed to fetch load details')
      console.error('Error fetching load details:', error)
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
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!load) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Load not found</h2>
        <p className="text-gray-600 mt-2">The requested load could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <LoadInfo load={load} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DocumentStatus 
            documents={documents}
            onClassificationUpdate={handleClassificationUpdate}
          />
          
          <div className="mt-8">
            <DocumentUpload onUpload={handleDocumentUpload} />
          </div>
        </div>

        <div>
          <DocumentList 
            documents={documents}
            onClassificationUpdate={handleClassificationUpdate}
          />
        </div>
      </div>
    </div>
  )
} 