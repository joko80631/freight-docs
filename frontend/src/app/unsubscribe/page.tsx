'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function UnsubscribePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No unsubscribe token provided');
      setIsLoading(false);
      return;
    }

    const handleUnsubscribe = async () => {
      try {
        const response = await fetch(`/api/unsubscribe?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to unsubscribe');
        }

        setSuccess(true);
        setMessage(data.message);
      } catch (error) {
        console.error('Error unsubscribing:', error);
        setError(error instanceof Error ? error.message : 'Failed to unsubscribe');
      } finally {
        setIsLoading(false);
      }
    };

    handleUnsubscribe();
  }, [token]);

  if (isLoading) {
    return (
      <div className="container max-w-lg mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Processing Unsubscribe Request</CardTitle>
            <CardDescription>
              Please wait while we process your request...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-lg mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Unsubscribe Failed
            </CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Unsubscribed Successfully
          </CardTitle>
          <CardDescription>
            {message || 'You have been successfully unsubscribed.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            If you change your mind, you can update your email preferences in your account settings.
          </p>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 