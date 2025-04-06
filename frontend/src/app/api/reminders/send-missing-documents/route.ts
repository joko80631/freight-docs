import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTemplatedEmail } from '@/lib/email/utils/email-sender';
import { generateUnsubscribeUrl } from '@/lib/email/utils/unsubscribe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_REMINDERS_PER_WINDOW = 3; // Maximum reminders per window

export async function POST(request: NextRequest) {
  try {
    // Get shipments with missing documents
    const { data: shipments, error: shipmentsError } = await supabase
      .from('shipments')
      .select(`
        id,
        reference_number,
        status,
        missing_documents,
        due_date,
        shipper:shipper_id (
          id,
          name,
          email
        ),
        consignee:consignee_id (
          id,
          name,
          email
        )
      `)
      .eq('status', 'pending_documents')
      .not('missing_documents', 'is', null)
      .not('missing_documents', 'eq', '{}');

    if (shipmentsError) {
      console.error('Error fetching shipments:', shipmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch shipments' },
        { status: 500 }
      );
    }

    if (!shipments || shipments.length === 0) {
      return NextResponse.json({ message: 'No shipments with missing documents found' });
    }

    // Process each shipment
    const results = await Promise.all(
      shipments.map(async (shipment) => {
        try {
          // Check rate limiting
          const { data: reminders, error: remindersError } = await supabase
            .from('email_events')
            .select('created_at')
            .eq('email_id', `missing-docs-${shipment.id}`)
            .eq('event_type', 'sent')
            .gte('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString())
            .order('created_at', { ascending: false });

          if (remindersError) {
            console.error(`Error checking rate limit for shipment ${shipment.id}:`, remindersError);
            return { shipmentId: shipment.id, success: false, error: 'Rate limit check failed' };
          }

          // Skip if rate limit exceeded
          if (reminders && reminders.length >= MAX_REMINDERS_PER_WINDOW) {
            return { shipmentId: shipment.id, success: false, error: 'Rate limit exceeded' };
          }

          // Get user preferences
          const recipients = [shipment.shipper, shipment.consignee].filter(Boolean);
          
          // Filter recipients based on email preferences
          const eligibleRecipients = await Promise.all(
            recipients.map(async (recipient) => {
              if (!recipient || !recipient.email) return null;
              
              const { data: preferences } = await supabase
                .from('notification_preferences')
                .select('email_enabled, categories')
                .eq('user_id', recipient.id)
                .single();
              
              if (!preferences) return recipient;
              
              // Check if user has opted out of emails or this category
              if (!preferences.email_enabled) return null;
              if (preferences.categories && preferences.categories['missing-documents'] === false) return null;
              
              return recipient;
            })
          );
          
          const filteredRecipients = eligibleRecipients.filter(Boolean);
          
          if (filteredRecipients.length === 0) {
            return { shipmentId: shipment.id, success: false, error: 'No eligible recipients' };
          }

          // Send reminder emails
          const emailResults = await Promise.all(
            filteredRecipients.map(async (recipient) => {
              if (!recipient) return null;
              
              const unsubscribeUrl = generateUnsubscribeUrl(
                recipient.id,
                recipient.email,
                'missing-documents'
              );
              
              const emailData = {
                recipient: {
                  name: recipient.name,
                  email: recipient.email,
                },
                shipment: {
                  id: shipment.id,
                  reference: shipment.reference_number,
                  missingDocuments: shipment.missing_documents,
                  dueDate: shipment.due_date,
                },
                unsubscribeUrl,
              };
              
              try {
                await sendTemplatedEmail({
                  to: recipient.email,
                  templateId: 'missing-documents-reminder',
                  data: emailData,
                });
                
                // Record the email event
                await supabase.from('email_events').insert({
                  email_id: `missing-docs-${shipment.id}`,
                  user_id: recipient.id,
                  event_type: 'sent',
                  event_data: {
                    shipment_id: shipment.id,
                    template: 'missing-documents-reminder',
                  },
                });
                
                return { recipientId: recipient.id, success: true };
              } catch (error) {
                console.error(`Error sending email to ${recipient.email}:`, error);
                return { recipientId: recipient.id, success: false, error };
              }
            })
          );
          
          return {
            shipmentId: shipment.id,
            success: true,
            emailResults: emailResults.filter(Boolean),
          };
        } catch (error) {
          console.error(`Error processing shipment ${shipment.id}:`, error);
          return { shipmentId: shipment.id, success: false, error };
        }
      })
    );

    return NextResponse.json({
      message: 'Missing document reminders processed',
      results,
    });
  } catch (error) {
    console.error('Error sending missing document reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send missing document reminders' },
      { status: 500 }
    );
  }
} 