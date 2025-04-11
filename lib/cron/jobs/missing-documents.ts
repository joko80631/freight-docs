/**
 * Missing documents scan job
 * Scans for loads with incomplete document sets and sends reminder emails to customers
 */

import { createClient } from '@supabase/supabase-js';
import { CronJobResult } from '../types';
import { sendTemplatedEmail } from '../../email';
import { getEmailMonitoringService, EmailEventType } from '../../email/monitoring';
import { getEmailRecoveryService } from '../../email/recovery';
import { EmailSendError } from '../../email/errors';
import type { EmailRecipient, EmailOptions } from '../../email/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Load {
  id: string;
  reference_number: string;
  customer_email: string;
  customer_name: string;
  missing_documents: string[];
}

interface ReminderRecord {
  loadId: string;
  documentType: string;
  lastSent: Date;
  sentCount: number;
}

// In-memory store for reminder records (in production, this would be in a database)
const reminderRecords = new Map<string, ReminderRecord>();

// Mock function to get loads with incomplete documents
async function getLoadsWithIncompleteDocuments(): Promise<Load[]> {
  // In production, this would query your database
  return [
    {
      id: 'load1',
      reference_number: 'REF12345',
      customer_email: 'customer1@example.com',
      customer_name: 'Customer One',
      missing_documents: ['bill-of-lading'],
    },
  ];
}

// Check if a reminder was recently sent
function wasReminderSent(loadId: string, documentType: string): boolean {
  const key = `${loadId}:${documentType}`;
  const record = reminderRecords.get(key);
  
  if (!record) {
    return false;
  }

  // Check if reminder was sent in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return record.lastSent > twentyFourHoursAgo;
}

// Record that a reminder was sent
async function recordReminderSent(load: Load, reminderCount: number): Promise<void> {
  const { error } = await supabase.from('reminder_records').insert({
    load_id: load.id,
    reminder_count: reminderCount,
    sent_at: new Date().toISOString(),
    reminder_type: 'missing_documents'
  });

  if (error) {
    throw new Error(`Failed to record reminder: ${error.message}`);
  }
}

// Get the number of reminders sent for a load/document
function getReminderCount(loadId: string, documentType: string): number {
  const key = `${loadId}:${documentType}`;
  const record = reminderRecords.get(key);
  return record?.sentCount || 0;
}

// Check if we should send a reminder based on preferences and history
function shouldSendReminder(load: Load, documentType: string): boolean {
  // Check if reminder was recently sent
  if (wasReminderSent(load.id, documentType)) {
    return false;
  }

  // Check if we've sent too many reminders (max 3 per document)
  if (getReminderCount(load.id, documentType) >= 3) {
    return false;
  }

  return true;
}

/**
 * Missing documents scan job
 */
export async function missingDocumentsScanJob(): Promise<CronJobResult> {
  const monitoringService = getEmailMonitoringService();
  const recoveryService = getEmailRecoveryService();
  
  let emailsSent = 0;
  let emailsFailed = 0;
  const failures: { recipient: string; error: string }[] = [];

  try {
    // Get loads with incomplete documents
    const loads = await getLoadsWithIncompleteDocuments();
    
    // Process each load
    for (const load of loads) {
      const pendingDocuments = load.missing_documents;
      
      for (const doc of pendingDocuments) {
        if (!shouldSendReminder(load, doc)) {
          continue;
        }

        const recipient: EmailRecipient = {
          email: load.customer_email,
          name: load.customer_name
        };

        try {
          const emailData = {
            documentType: doc,
            dueDate: new Date().toISOString(),
            uploadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/loads/${load.id}/documents/upload`,
            loadId: load.id,
            customerName: load.customer_name
          };

          const emailOptions = {
            subject: `Document Required: ${doc} for Load ${load.id}`,
            category: 'reminders',
            metadata: {
              loadId: load.id,
              documentType: doc,
              dueDate: new Date().toISOString(),
            }
          };

          await sendTemplatedEmail('missing-document', emailData, recipient, emailOptions);
          
          monitoringService.logEvent({
            type: EmailEventType.SENT,
            templateName: 'missing-document',
            recipient: recipient.email,
            metadata: {
              loadId: load.id,
              documentType: doc,
              reminderCount: getReminderCount(load.id, doc),
            }
          });

          await recordReminderSent(load, getReminderCount(load.id, doc) + 1);
          emailsSent++;
        } catch (error) {
          emailsFailed++;
          failures.push({
            recipient: recipient.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          if (error instanceof EmailSendError) {
            monitoringService.logEvent({
              type: EmailEventType.FAILED,
              templateName: 'missing-document',
              recipient: recipient.email,
              error: {
                code: 'EMAIL_SEND_ERROR',
                message: error.message,
              },
              metadata: {
                loadId: load.id,
                documentType: doc,
              }
            });

            const recoveryService = getEmailRecoveryService();
            const emailOptions: EmailOptions = {
              to: recipient,
              subject: `Document Required: ${doc} for Load ${load.id}`,
              content: `Please submit the required document: ${doc}`,
              metadata: {
                loadId: load.id,
                documentType: doc,
                dueDate: new Date().toISOString(),
              }
            };

            recoveryService.addToRetryQueue(
              load.id,
              emailOptions,
              error,
              'missing-document'
            );
          }
        }
      }
    }

    return {
      success: emailsFailed === 0,
      message: `Processed ${loads.length} loads, sent ${emailsSent} emails, failed ${emailsFailed}`,
      data: {
        loadsProcessed: loads.length,
        emailsSent,
        emailsFailed,
        failures,
      },
    };
  } catch (error) {
    console.error('Error in missing documents scan job:', error);
    return {
      success: false,
      message: `Job failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: {
        code: 'JOB_EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      },
      data: {
        emailsSent,
        emailsFailed,
        failures,
      },
    };
  }
}

async function sendReminder(load: Load, reminderCount: number): Promise<void> {
  const recipient: EmailRecipient = {
    email: load.customer_email,
    name: load.customer_name
  };

  try {
    await sendTemplatedEmail(
      'missing-document',
      {
        documentType: load.missing_documents.join(', '),
        dueDate: new Date().toISOString(),
        uploadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/loads/${load.id}/documents/upload`,
        loadId: load.id,
        recipientName: load.customer_name,
        recipientEmail: load.customer_email
      },
      recipient,
      {
        subject: `Missing Documents Reminder for Load ${load.reference_number}`,
        category: 'reminders',
        metadata: {
          loadId: load.id,
          reminderCount,
          referenceNumber: load.reference_number
        }
      }
    );

    await recordReminderSent(load, reminderCount);
  } catch (error) {
    if (error instanceof EmailSendError) {
      const recoveryService = getEmailRecoveryService();
      const emailOptions: EmailOptions = {
        to: recipient,
        subject: `Document Required: ${load.missing_documents.join(', ')} for Load ${load.id}`,
        content: `Please submit the required document: ${load.missing_documents.join(', ')}`,
        metadata: {
          loadId: load.id,
          documentType: load.missing_documents.join(', '),
          dueDate: new Date().toISOString(),
        }
      };
      
      recoveryService.addToRetryQueue(
        load.id,
        emailOptions,
        error,
        'missing-document'
      );
    }
    throw error;
  }
}

async function processLoads(loads: Load[]): Promise<CronJobResult> {
  const monitoringService = getEmailMonitoringService();
  let emailsSent = 0;
  let emailsFailed = 0;
  const failures: { recipient: string; error: string }[] = [];

  for (const load of loads) {
    const pendingDocuments = load.missing_documents;
    
    for (const doc of pendingDocuments) {
      if (!shouldSendReminder(load, doc)) {
        continue;
      }

      const recipient: EmailRecipient = {
        email: load.customer_email,
        name: load.customer_name
      };

      try {
        const emailData = {
          documentType: doc,
          dueDate: new Date().toISOString(),
          uploadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/loads/${load.id}/documents/upload`,
          loadId: load.id,
          customerName: load.customer_name
        };

        const emailOptions = {
          subject: `Document Required: ${doc} for Load ${load.id}`,
          category: 'reminders',
          metadata: {
            loadId: load.id,
            documentType: doc,
            dueDate: new Date().toISOString(),
          }
        };

        await sendTemplatedEmail('missing-document', emailData, recipient, emailOptions);
        
        monitoringService.logEvent({
          type: EmailEventType.SENT,
          templateName: 'missing-document',
          recipient: recipient.email,
          metadata: {
            loadId: load.id,
            documentType: doc,
            reminderCount: getReminderCount(load.id, doc),
          }
        });

        await recordReminderSent(load, getReminderCount(load.id, doc) + 1);
        emailsSent++;
      } catch (error) {
        emailsFailed++;
        failures.push({
          recipient: recipient.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        if (error instanceof EmailSendError) {
          monitoringService.logEvent({
            type: EmailEventType.FAILED,
            templateName: 'missing-document',
            recipient: recipient.email,
            error: {
              code: 'EMAIL_SEND_ERROR',
              message: error.message,
            },
            metadata: {
              loadId: load.id,
              documentType: doc,
            }
          });

          const recoveryService = getEmailRecoveryService();
          const emailOptions: EmailOptions = {
            to: recipient,
            subject: `Document Required: ${doc} for Load ${load.id}`,
            content: `Please submit the required document: ${doc}`,
            metadata: {
              loadId: load.id,
              documentType: doc,
              dueDate: new Date().toISOString(),
            }
          };

          recoveryService.addToRetryQueue(
            load.id,
            emailOptions,
            error,
            'missing-document'
          );
        }
      }
    }
  }

  return {
    success: emailsFailed === 0,
    message: `Processed ${loads.length} loads, sent ${emailsSent} emails, failed ${emailsFailed}`,
    data: {
      loadsProcessed: loads.length,
      emailsSent,
      emailsFailed,
      failures,
    },
  };
} 