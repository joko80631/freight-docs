'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: rememberMe
        }
      })

      if (error) throw error

      toast.success('Successfully logged in!')
      
      // Redirect to the original page or dashboard
      const redirectTo = searchParams.get('redirectedFrom') || '/loads'
      router.push(redirectTo)
    } catch (error) {
      toast.error(error.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      toast.success('Password reset instructions sent to your email')
    } catch (error) {
      toast.error(error.message || 'Failed to send reset instructions')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-6 border border-primary rounded-lg">
        <div>
          <h2 className="text-2xl font-bold text-center">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/signup" className="text-primary hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-primary rounded-md p-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-primary rounded-md p-2"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary border-primary rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm">
                Remember me
              </label>
            </div>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
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
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 