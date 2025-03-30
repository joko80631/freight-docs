'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing...')
  const [error, setError] = useState(null)

  useEffect(() => {
    const test = async () => {
      try {
        const { data, error } = await supabase.from('loads').select('*').limit(1)
        if (error) {
          setStatus('Error')
          setError(error.message)
        } else {
          setStatus('Success')
        }
      } catch (err) {
        setStatus('Exception')
        setError(err.message)
      }
    }

    test()
  }, [])

  return (
    <div className="p-6">
      <h1>Supabase Test</h1>
      <p>Status: {status}</p>
      {error && <p>Error: {error}</p>}
    </div>
  )
} 