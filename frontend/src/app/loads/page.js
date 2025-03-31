'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { API_ENDPOINTS, getApiHeaders } from '@/config/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, Plus, Truck, User } from 'lucide-react';
import SupabaseTest from '@/components/SupabaseTest';

// Temporarily hardcode Supabase credentials instead of using environment variables
// This is just for testing - we'll revert to environment variables after confirming it works
const supabase = createClientComponentClient({
  supabaseUrl: "https://wjgnnjnbnifprcnlazis.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZ25uam5ibmlmcHJjbmxhemlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNDc5NTEsImV4cCI6MjA1ODgyMzk1MX0.rcCor1RadYKfbwBxuioZyHwmQT-5x57bvJOkv_5R2zE",
  options: {
    global: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    },
    realtime: {
      eventsPerSecond: 10,
      headers: {
        'X-Client-Info': 'freight-docs-client',
      }
    }
  }
});

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

  useEffect(() => {
    fetchLoads();
  }, [sortBy, filterStatus, filterDocuments]);

  const fetchLoads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Log environment variables (redacted for security)
      console.log('Supabase URL configured:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yes' : 'No');
      console.log('Supabase Key configured:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No');
      
      // Log authentication status
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User authenticated:', user ? 'Yes' : 'No');
      
      console.log('Attempting to fetch loads from Supabase...');
      
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
        .order(sortBy, { ascending: false });

      if (loadsError) {
        console.error('Supabase error details:', loadsError);
        throw new Error(`Failed to fetch loads: ${loadsError.message}`);
      }
      
      console.log('Loads fetched successfully:', loadsData);
      setLoads(loadsData || []);
    } catch (error) {
      console.error('Error fetching loads:', error);
      setError(error.message);
      toast.error(`Failed to fetch loads: ${error.message}`);
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="p-4 m-4 bg-red-50 rounded-lg">
        <h3 className="font-bold text-lg">Debug Info</h3>
        <p>Using hardcoded Supabase credentials for testing</p>
      </div>
      
      <SupabaseTest />
      
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
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <Truck className="h-4 w-4 mr-1" />
                      {load.carrier_name}
                      {load.mc_number && (
                        <span className="ml-1 text-gray-500">({load.mc_number})</span>
                      )}
                    </div>
                    {load.driver_name && (
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        {load.driver_name}
                      </div>
                    )}
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