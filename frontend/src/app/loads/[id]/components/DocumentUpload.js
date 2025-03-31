'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { API_ENDPOINTS } from '@/config/api'
import { getApiHeaders } from '@/utils/api'
import { toast } from 'react-hot-toast'

export default function DocumentUpload({ loadId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [dueDate, setDueDate] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', acceptedFiles[0])
    formData.append('loadId', loadId)
    if (dueDate) {
      formData.append('dueDate', dueDate)
    }

    try {
      const response = await fetch(API_ENDPOINTS.documents.upload, {
        method: 'POST',
        headers: getApiHeaders(),
        body: formData
      })

      if (!response.ok) throw new Error('Failed to upload document')
      const document = await response.json()
      
      if (onUploadComplete) {
        onUploadComplete(document)
      }
      
      toast.success('Document uploaded successfully')
      setDueDate('') // Reset due date after successful upload
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }, [loadId, dueDate, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          <div>
            <p className="text-gray-600">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop a file here, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PDF, PNG, JPG (max 10MB)
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
          Due Date:
        </label>
        <input
          type="datetime-local"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        />
      </div>
    </div>
  )
} 