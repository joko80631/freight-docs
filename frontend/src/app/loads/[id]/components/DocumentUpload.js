'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

export default function DocumentUpload({ onUpload }) {
  const [isUploading, setIsUploading] = useState(false)
  const [dueDate, setDueDate] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    setIsUploading(true)
    
    try {
      for (const file of acceptedFiles) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error(`${file.name} is too large. Maximum size is 10MB.`)
          continue
        }

        if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
          toast.error(`${file.name} has an unsupported file type.`)
          continue
        }

        await onUpload(file, dueDate)
      }
      // Clear the due date after successful upload
      setDueDate('')
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Failed to upload one or more files')
    } finally {
      setIsUploading(false)
    }
  }, [onUpload, dueDate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading
  })

  return (
    <div className="bg-white border border-primary rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
      
      {/* Due Date Field */}
      <div className="mb-4">
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date (Optional)
        </label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          disabled={isUploading}
        />
      </div>
      
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-600">Uploading documents...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                {isDragActive
                  ? 'Drop the files here'
                  : 'Drag and drop files here, or click to select files'
                }
              </p>
              <p className="mt-1">
                Supported formats: PDF, JPG, PNG (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 