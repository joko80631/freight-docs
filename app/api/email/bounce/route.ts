import { NextRequest, NextResponse } from 'next/server';
import { getEmailRecoveryService } from '@/lib/email/recovery';
import { getEmailMonitoringService } from '@/lib/email/monitoring';
import { EmailEventType } from '@/lib/email/monitoring';

/**
 * Handle email bounce webhook
 * This endpoint receives bounce notifications from the email provider
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.emailId || !body.recipient) {
      return NextResponse.json(
        { error: 'Missing required fields: emailId and recipient' },
        { status: 400 }
      );
    }
    
    // Extract bounce information
    const { emailId, recipient, reason = 'Unknown reason', type = 'bounce' } = body;
    
    // Get the recovery service
    const recoveryService = getEmailRecoveryService();
    
    // Handle the bounce
    recoveryService.handleBounce(emailId, recipient, reason);
    
    // Log the bounce event
    const monitoringService = getEmailMonitoringService();
    monitoringService.logEvent({
      type: EmailEventType.BOUNCED,
      emailId,
      recipient,
      error: {
        code: 'BOUNCE',
        message: reason,
      },
      metadata: {
        bounceType: type,
      },
    });
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling email bounce:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to process email bounce' },
      { status: 500 }
    );
  }
} 