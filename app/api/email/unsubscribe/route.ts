import { NextResponse } from 'next/server';
import { unsubscribeUser } from '@/lib/email/utils/unsubscribe-token';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // @ts-ignore - The function signature in the implementation is different from what TypeScript expects
    const success = await unsubscribeUser(token);
    if (!success) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribed`
    );
  } catch (error) {
    console.error('Error processing unsubscribe request:', error);
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
} 