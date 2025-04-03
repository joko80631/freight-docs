'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing...')
  const [error, setError] = useState(null)
  const supabase = createClientComponentClient()

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
  }, [supabase])

  return (
    <div className="p-6">
      <h1>Supabase Test</h1>
      <p>Status: {status}</p>
      {error && <p>Error: {error}</p>}
    </div>
  )
} 