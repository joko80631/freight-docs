'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    termsAccepted: false
  })
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.termsAccepted) {
      toast.error('Please accept the terms of service')
      setIsLoading(false)
      return
    }

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            company_name: formData.companyName
          }
        }
      })

      if (authError) throw authError

      // Create a profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name: formData.name,
            company_name: formData.companyName,
            email: formData.email,
            created_at: new Date().toISOString()
          }
        ])

      if (profileError) throw profileError

      toast.success('Account created successfully! Please check your email to verify your account.')
      router.push('/login')
    } catch (error) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-6 border border-primary rounded-lg">
        <div>
          <h2 className="text-2xl font-bold text-center">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-primary rounded-md p-2"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-primary rounded-md p-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium">
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="mt-1 block w-full border border-primary rounded-md p-2"
              placeholder="Your Company LLC"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full border border-primary rounded-md p-2"
              placeholder="••••••••"
            />
            <p className="mt-1 text-sm text-gray-600">
              Must be at least 8 characters long
            </p>
          </div>

          <div className="flex items-center">
            <input
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              required
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-primary rounded"
            />
            <label htmlFor="termsAccepted" className="ml-2 block text-sm">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-primary rounded-md shadow-sm text-sm font-medium text-background bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 