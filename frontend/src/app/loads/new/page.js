'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewLoadPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(e.target)
    const data = {
      load_number: formData.get('load_number'),
      carrier_name: formData.get('carrier_name'),
      delivery_date: formData.get('delivery_date'),
    }

    try {
      const response = await fetch('/api/loads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create load')
      }

      router.push('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Load</h1>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 border border-primary p-6">
        <div>
          <label htmlFor="load_number" className="block text-sm font-medium mb-2">
            Load Number
          </label>
          <input
            type="text"
            id="load_number"
            name="load_number"
            required
            className="w-full border border-primary p-2"
            placeholder="e.g., LOAD-001"
          />
        </div>

        <div>
          <label htmlFor="carrier_name" className="block text-sm font-medium mb-2">
            Carrier Name
          </label>
          <input
            type="text"
            id="carrier_name"
            name="carrier_name"
            required
            className="w-full border border-primary p-2"
            placeholder="Enter carrier name"
          />
        </div>

        <div>
          <label htmlFor="delivery_date" className="block text-sm font-medium mb-2">
            Delivery Date
          </label>
          <input
            type="date"
            id="delivery_date"
            name="delivery_date"
            className="w-full border border-primary p-2"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-primary hover:bg-primary hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Load'}
        </button>
      </form>
    </div>
  )
} 