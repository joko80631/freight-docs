'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const email = searchParams.get('email');
  const type = searchParams.get('type');

  const handleUnsubscribe = async () => {
    if (!email || !type) {
      toast({
        title: 'Error',
        description: 'Invalid unsubscribe link',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('email_preferences')
        .update({ [type]: false })
        .eq('email', email);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Successfully unsubscribed from emails',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!email || !type) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid Link</CardTitle>
          <CardDescription>
            This unsubscribe link appears to be invalid or expired.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unsubscribe from Emails</CardTitle>
        <CardDescription>
          You are about to unsubscribe {email} from {type} emails.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleUnsubscribe}>
          Confirm Unsubscribe
        </Button>
      </CardContent>
    </Card>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we process your request.
            </CardDescription>
          </CardHeader>
        </Card>
      }>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
} 