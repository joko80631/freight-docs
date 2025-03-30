'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { API_ENDPOINTS, getApiHeaders } from '@/config/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, Plus } from 'lucide-react';

// Required document types constant
const REQUIRED_DOCUMENTS = ['POD', 'BOL', 'Invoice'];

export default function LoadsPage() {
  const [loads, setLoads] = useState([]);
  const [documents, setDocuments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDocuments, setFilterDocuments] = useState('all');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchLoads();
  }, [sortBy, filterStatus, filterDocuments]);

  const fetchLoads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.loads.list, {
        headers: getApiHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loads');
      }

      const loadsData = await response.json();
      
      // Fetch documents for all loads
      const docsResponse = await fetch(API_ENDPOINTS.documents.list, {
        headers: getApiHeaders()
      });

      if (!docsResponse.ok) {
        throw new Error('Failed to fetch documents');
      }

      const documentsData = await docsResponse.json();
      
      // Group documents by load_id
      const documentsMap = {};
      documentsData?.forEach(doc => {
        if (!documentsMap[doc.load_id]) {
          documentsMap[doc.load_id] = [];
        }
        documentsMap[doc.load_id].push(doc);
      });
      
      setDocuments(documentsMap);
      setLoads(loadsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch loads');
      toast.error('Failed to fetch loads');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate document status for a load
  const getDocumentStatus = (loadId) => {
    const loadDocuments = documents[loadId] || [];
    const documentTypes = loadDocuments.map(doc => doc.document_type);
    const missingTypes = REQUIRED_DOCUMENTS.filter(type => !documentTypes.includes(type));
    
    if (missingTypes.length === 0) return 'complete';
    if (documentTypes.length > 0) return 'partial';
    return 'none';
  };
  
  // Get color based on document status
  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'none': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get icon based on document status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return '✅';
      case 'partial': return '⚠️';
      case 'none': return '❌';
      default: return '❓';
    }
  };
  
  // Filter loads based on selected filters
  const filteredLoads = loads.filter(load => {
    const documentStatus = getDocumentStatus(load.id);
    const statusMatch = filterStatus === 'all' || load.status === filterStatus;
    const documentMatch = filterDocuments === 'all' || documentStatus === filterDocuments;
    return statusMatch && documentMatch;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Loads</h1>
        <Link 
          href="/loads/new" 
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Load
        </Link>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md p-2"
        >
          <option value="created_at">Sort by Date</option>
          <option value="reference_number">Sort by Reference</option>
          <option value="status">Sort by Status</option>
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-md p-2"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
        </select>
        
        <select
          value={filterDocuments}
          onChange={(e) => setFilterDocuments(e.target.value)}
          className="border border-gray-300 rounded-md p-2"
        >
          <option value="all">All Documents</option>
          <option value="complete">Complete Documents</option>
          <option value="partial">Partial Documents</option>
          <option value="none">No Documents</option>
        </select>
      </div>
      
      {filteredLoads.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          No loads found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          {filteredLoads.map((load) => {
            const documentStatus = getDocumentStatus(load.id);
            const loadDocuments = documents[load.id] || [];
            const documentTypes = loadDocuments.map(doc => doc.document_type);
            const missingTypes = REQUIRED_DOCUMENTS.filter(type => !documentTypes.includes(type));
            
            return (
              <Link 
                key={load.id} 
                href={`/loads/${load.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">{load.reference_number}</h2>
                    <p className="text-sm text-gray-600">{load.customer?.name || 'No Customer'}</p>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Route:</span> {load.origin} → {load.destination}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Created:</span> {new Date(load.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                      {load.status}
                    </span>
                    
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(documentStatus)}`}>
                        <span className="mr-1">{getStatusIcon(documentStatus)}</span>
                        {loadDocuments.length}/{REQUIRED_DOCUMENTS.length} Documents
                      </span>
                    </div>
                    
                    {missingTypes.length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        Missing: {missingTypes.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
} 