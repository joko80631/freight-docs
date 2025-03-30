'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_ENDPOINTS, getApiHeaders } from '@/config/api'
import toast from 'react-hot-toast'

export default function NewLoadPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target)
    const data = {
      load_number: formData.get('load_number'),
      carrier_name: formData.get('carrier_name'),
      delivery_date: formData.get('delivery_date'),
    }

    try {
      const response = await fetch(API_ENDPOINTS.loads.create, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create load')
      }

      toast.success('Load created successfully')
      router.push('/')
    } catch (err) {
      toast.error(err.message || 'Failed to create load')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Load</h1>
      
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
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
              Creating...
            </>
          ) : (
            'Create Load'
          )}
        </button>
      </form>
    </div>
  )
} 