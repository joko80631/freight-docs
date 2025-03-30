'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing connection...');
  const [details, setDetails] = useState('');
  
  useEffect(() => {
    // Get environment variables and log them
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log('Test component - URL:', supabaseUrl);
    console.log('Test component - Key available:', !!supabaseKey);
    
    // Initialize Supabase client
    const supabase = createClientComponentClient({
      supabaseUrl,
      supabaseKey,
    });
    
    async function testConnection() {
      try {
        setStatus('Testing connection to Supabase...');
        
        // First, check if we can connect at all
        const { data: pingData, error: pingError } = await supabase.from('_realtime').select('*').limit(1);
        
        if (pingError) {
          setStatus('Connection error');
          setDetails(`Error: ${pingError.message}`);
          console.error('Ping error:', pingError);
          return;
        }
        
        // Try to query the loads table
        const { data: loadData, error: loadError } = await supabase.from('loads').select('count');
        
        if (loadError) {
          setStatus('Table access error');
          setDetails(`Error: ${loadError.message}`);
          console.error('Load query error:', loadError);
          return;
        }
        
        setStatus('Connected successfully!');
        setDetails(`Found ${loadData.length} loads`);
      } catch (e) {
        setStatus('Exception occurred');
        setDetails(e.message);
        console.error('Connection test exception:', e);
      }
    }
    
    testConnection();
  }, []);
  
  return (
    <div className="p-4 m-4 bg-blue-50 rounded-lg">
      <h3 className="font-bold text-lg">Supabase Connection Test</h3>
      <p className="font-medium">{status}</p>
      <p className="text-sm text-gray-600">{details}</p>
    </div>
  );
} 