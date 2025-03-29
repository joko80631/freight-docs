'use client'

import { useState, useEffect } from 'react'

export default function UploadPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
        setLoads(data)
      } catch (err) {
        setError('Failed to load available loads')
        console.error('Error fetching loads:', err)
      } finally {
        setIsLoadingLoads(false)
      }
    }

    fetchLoads()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const formData = new FormData(e.target)
    const file = formData.get('file')
    const loadId = formData.get('load_id')

    if (!file) {
      setError('Please select a file')
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

      setSuccess('File uploaded successfully')
      e.target.reset()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Document</h1>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded">
          {success}
        </div>
      )}
      
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
            disabled={isLoadingLoads}
          >
            <option value="">Select a load...</option>
            {isLoadingLoads ? (
              <option value="" disabled>Loading loads...</option>
            ) : loads.length === 0 ? (
              <option value="" disabled>No loads available</option>
            ) : (
              loads.map(load => (
                <option key={load.id} value={load.id}>
                  {load.load_number} – {load.carrier_name}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-primary hover:bg-primary hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  )
} 