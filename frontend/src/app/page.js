'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import DocumentStatusIndicator from '@/components/ui/DocumentStatusIndicator'

const DOCUMENT_TYPES = {
  BOL: 'Bill of Lading',
  POD: 'Proof of Delivery',
  INVOICE: 'Invoice'
}

const LOAD_STATUSES = {
  PENDING: 'Pending',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed'
}

export default function Dashboard() {
  const [loads, setLoads] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState('created_at')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDocuments, setFilterDocuments] = useState('all')
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchLoads()
  }, [])

  async function fetchLoads() {
    try {
      const { data: loadsData, error: loadsError } = await supabase
        .from('loads')
        .select(`
          *,
          documents (
            id,
            type,
            status
          )
        `)
        .order(sortBy, { ascending: false })

      if (loadsError) throw loadsError

      setLoads(loadsData || [])
    } catch (error) {
      toast.error('Failed to fetch loads')
      console.error('Error fetching loads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case LOAD_STATUSES.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case LOAD_STATUSES.IN_TRANSIT:
        return 'bg-blue-100 text-blue-800'
      case LOAD_STATUSES.DELIVERED:
        return 'bg-green-100 text-green-800'
      case LOAD_STATUSES.COMPLETED:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentStatus = (load) => {
    const requiredDocs = Object.keys(DOCUMENT_TYPES)
    const completedDocs = load.documents?.filter(doc => doc.status === 'completed') || []
    const completionPercentage = (completedDocs.length / requiredDocs.length) * 100
    
    if (completionPercentage === 100) return 'complete'
    if (completionPercentage > 0) return 'partial'
    return 'incomplete'
  }

  const filteredLoads = loads.filter(load => {
    const statusMatch = filterStatus === 'all' || load.status === filterStatus
    const documentMatch = filterDocuments === 'all' || getDocumentStatus(load) === filterDocuments
    return statusMatch && documentMatch
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loads</h1>
        <Link 
          href="/loads/new" 
          className="px-4 py-2 border border-primary hover:bg-primary hover:text-background transition-colors"
        >
          New Load
        </Link>
      </div>

      <div className="flex space-x-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-primary rounded-md p-2"
        >
          <option value="created_at">Sort by Date</option>
          <option value="load_number">Sort by Load Number</option>
          <option value="status">Sort by Status</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-primary rounded-md p-2"
        >
          <option value="all">All Statuses</option>
          {Object.values(LOAD_STATUSES).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={filterDocuments}
          onChange={(e) => setFilterDocuments(e.target.value)}
          className="border border-primary rounded-md p-2"
        >
          <option value="all">All Documents</option>
          <option value="complete">Complete Documents</option>
          <option value="partial">Partial Documents</option>
          <option value="incomplete">No Documents</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredLoads.length === 0 ? (
        <div className="text-center py-12 border border-primary rounded-lg">
          <p className="text-gray-600">No loads found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoads.map((load) => (
            <Link 
              key={load.id} 
              href={`/loads/${load.id}`}
              className="block border border-primary rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{load.load_number}</h2>
                  <p className="text-sm text-gray-600">{load.carrier_name}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(load.status)}`}>
                  {load.status}
                </span>
              </div>

              <div className="mt-4">
                <DocumentStatusIndicator documents={load.documents || []} />
              </div>

              <div className="mt-4 flex space-x-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(load.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Delivery:</span>{' '}
                  {new Date(load.delivery_date).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 