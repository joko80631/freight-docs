'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { API_ENDPOINTS, getApiHeaders } from '@/config/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, Plus, Truck, User } from 'lucide-react';
import { DevPanel } from '@/components/DevPanel';
import useTeamStore from '@/store/teamStore';

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
  const { teamId, teamName } = useTeamStore();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!teamId) {
      setError('Please select a team to view loads');
      setIsLoading(false);
      return;
    }
    fetchLoads();
  }, [sortBy, filterStatus, filterDocuments, teamId]);

  const fetchLoads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching loads for team:', teamId);
      
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
        .eq('team_id', teamId)
        .order(sortBy, { ascending: false });

      if (loadsError) {
        console.error('Supabase error details:', loadsError);
        throw new Error(`Failed to fetch loads: ${loadsError.message}`);
      }
      
      console.log('Loads fetched successfully:', loadsData);
      setLoads(loadsData || []);

      // Log if no loads found
      if (!loadsData || loadsData.length === 0) {
        console.warn('No loads found for team:', teamId);
      }
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

  if (!teamId) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
          <h2 className="text-lg font-semibold">No Team Selected</h2>
          <p>Please select a team to view and manage loads.</p>
        </div>
      </div>
    );
  }

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Loads</h1>
          <p className="text-sm text-gray-600">Team: {teamName}</p>
        </div>
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
          No loads found for this team
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          {filteredLoads.map((load) => {
            const documentStatus = getDocumentStatus(load.id);
            const loadDocuments = documents[load.id] || [];
            const documentTypes = loadDocuments.map(doc => doc.document_type);
            const missingTypes = REQUIRED_DOCUMENTS.filter(type => !documentTypes.includes(type));
            
            return (
              <div key={load.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold">{load.load_number}</h2>
                    <p className="text-sm text-gray-600">{load.carrier_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(documentStatus)}`}>
                    {getStatusIcon(documentStatus)}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Missing documents: {missingTypes.join(', ')}
                  </p>
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
              </div>
            );
          })}
        </div>
      )}

      <DevPanel />
    </div>
  );
} 