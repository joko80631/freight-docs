import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Verify that the request is coming from our cron service
function verifyCronRequest(request: NextRequest): boolean {
  const headersList = headers();
  const cronSecret = headersList.get('x-cron-secret');
  return cronSecret === process.env.CRON_SECRET;
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from our cron service
    if (!verifyCronRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the missing documents API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reminders/send-missing-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to send missing document reminders: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in missing document reminders cron job:', error);
    return NextResponse.json(
      { error: 'Failed to process missing document reminders' },
      { status: 500 }
    );
  }
} 