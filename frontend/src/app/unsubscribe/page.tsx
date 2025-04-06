'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { processUnsubscribe } from '@/lib/email/utils/unsubscribe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean;
    message: string;
  }>({
    loading: true,
    success: false,
    message: '',
  });

  useEffect(() => {
    async function handleUnsubscribe() {
      if (!token) {
        setStatus({
          loading: false,
          success: false,
          message: 'No unsubscribe token provided',
        });
        return;
      }

      try {
        const result = await processUnsubscribe(token);
        setStatus({
          loading: false,
          success: result.success,
          message: result.message,
        });
      } catch (error) {
        setStatus({
          loading: false,
          success: false,
          message: 'An error occurred while processing your request',
        });
      }
    }

    handleUnsubscribe();
  }, [token]);

  return (
    <div className="container mx-auto py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          {status.loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4">Processing your request...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`p-4 rounded-md ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p>{status.message}</p>
              </div>

              <div className="text-center">
                <p className="mb-4">
                  {status.success
                    ? 'You can always update your email preferences in your account settings.'
                    : 'If you believe this is an error, please contact support.'}
                </p>
                <Button asChild>
                  <Link href="/settings">
                    {status.success ? 'Go to Settings' : 'Contact Support'}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 