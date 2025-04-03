'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function UploadPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loads, setLoads] = useState([])
  const [isLoadingLoads, setIsLoadingLoads] = useState(true)

  useEffect(() => {
    async function fetchLoads() {
      try {
        const response = await fetch('/api/loads')
        if (!response.ok) {
          throw new Error('Failed to fetch loads')
        }
        const data = await response.json()
        setLoads(data || [])
      } catch (err) {
        toast.error('Failed to load available loads')
        console.error('Error fetching loads:', err)
        setLoads([])
      } finally {
        setIsLoadingLoads(false)
      }
    }

    fetchLoads()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target)
    const file = formData.get('file')
    const loadId = formData.get('load_id')

    if (!file) {
      toast.error('Please select a file')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload file')
      }

      toast.success('File uploaded successfully')
      e.target.reset()
    } catch (err) {
      toast.error(err.message || 'Failed to upload file')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Document</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 border border-primary p-6">
        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-2">
            Select Document
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".pdf,.txt"
            className="w-full border border-primary p-2"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-600">
            Supported formats: PDF, TXT (max 10MB)
          </p>
        </div>

        <div>
          <label htmlFor="load_id" className="block text-sm font-medium mb-2">
            Associated Load (Optional)
          </label>
          <select
            id="load_id"
            name="load_id"
            className="w-full border border-primary p-2"
            disabled={isLoadingLoads || isSubmitting}
          >
            <option value="">Select a load...</option>
            {isLoadingLoads ? (
              <option value="" disabled>Loading loads...</option>
            ) : !loads || loads.length === 0 ? (
              <option value="" disabled>No loads available</option>
            ) : (
              (loads || []).map(load => (
                <option key={load?.id} value={load?.id}>
                  {load?.load_number} – {load?.carrier_name}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-primary hover:bg-primary hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Upload Document'
          )}
        </button>
      </form>
    </div>
  )
} 