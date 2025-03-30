'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function VerifyEmailContent() {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'email_verification') {
          setError('Invalid verification link');
          setStatus('error');
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });

        if (error) throw error;

        setStatus('success');
      } catch (error) {
        setError(error.message);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [searchParams, supabase.auth]);

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'verifying' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Your email has been verified successfully! You can now log in to your account.
                </AlertDescription>
              </Alert>
              <Button onClick={handleLogin} className="w-full">
                Go to Login
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  {error || 'An error occurred during verification. Please try again.'}
                </AlertDescription>
              </Alert>
              <Button onClick={handleLogin} className="w-full">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 