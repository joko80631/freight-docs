/**
 * Missing documents scan job
 * Scans for loads with incomplete document sets and sends reminder emails to customers
 */

import { CronJobResult } from '../types';
import { sendTemplatedEmail } from '@/lib/email';
import { getEmailMonitoringService, EmailEventType } from '@/lib/email/monitoring';
import { getEmailRecoveryService } from '@/lib/email/recovery';
import { EmailSendError } from '@/lib/email/errors';
import { EmailPreferences, EmailRecipient } from '@/lib/email/types';

interface Load {
  id: string;
  customer: {
    id: string;
    email: string;
    name: string;
    emailPreferences?: EmailPreferences;
  };
  documents: {
    id: string;
    type: string;
    status: 'pending' | 'uploaded' | 'approved' | 'rejected';
    dueDate: Date;
  }[];
  teamReminderSettings: {
    enabled: boolean;
    recipients: string[];
    frequency: 'daily' | 'weekly';
  };
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
      customer: {
        id: 'customer1',
        email: 'customer1@example.com',
        name: 'Customer One',
        emailPreferences: {
          global_enabled: true,
          categories: {
            notifications: true,
          },
          frequency: {
            alerts: 'immediate',
          },
          source: 'manual',
          updated_at: new Date().toISOString(),
        },
      },
      documents: [
        {
          id: 'doc1',
          type: 'bill-of-lading',
          status: 'pending',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      ],
      teamReminderSettings: {
        enabled: true,
        recipients: ['team1@example.com'],
        frequency: 'daily',
      },
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
function recordReminderSent(loadId: string, documentType: string): void {
  const key = `${loadId}:${documentType}`;
  const existing = reminderRecords.get(key);
  
  if (existing) {
    existing.lastSent = new Date();
    existing.sentCount += 1;
  } else {
    reminderRecords.set(key, {
      loadId,
      documentType,
      lastSent: new Date(),
      sentCount: 1,
    });
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
  // Check if customer has unsubscribed
  if (load.customer.emailPreferences?.global_enabled === false) {
    return false;
  }

  // Check if notifications are disabled
  if (load.customer.emailPreferences?.categories?.notifications === false) {
    return false;
  }

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
  const failures: Array<{ recipient: string; error: string }> = [];

  try {
    // Get loads with incomplete documents
    const loads = await getLoadsWithIncompleteDocuments();
    
    // Process each load
    for (const load of loads) {
      // Find pending documents
      const pendingDocuments = load.documents.filter(doc => doc.status === 'pending');
      
      for (const doc of pendingDocuments) {
        // Check if we should send a reminder
        if (!shouldSendReminder(load, doc.type)) {
          continue;
        }

        const recipient: EmailRecipient = {
          email: load.customer.email,
          name: load.customer.name,
        };

        try {
          // Send reminder email using template
          const result = await sendTemplatedEmail(
            'missing-document',
            {
              customerName: load.customer.name,
              loadId: load.id,
              documentType: doc.type,
              dueDate: doc.dueDate,
            },
            recipient,
            {
              subject: `Document Required: ${doc.type} for Load ${load.id}`,
              category: 'notifications',
              metadata: {
                loadId: load.id,
                documentType: doc.type,
                dueDate: doc.dueDate.toISOString(),
              },
            }
          );

          if (result.success) {
            // Record the reminder was sent
            recordReminderSent(load.id, doc.type);
            
            // Log the event
            monitoringService.logEvent({
              type: EmailEventType.SENT,
              templateName: 'missing-document',
              recipient: load.customer.email,
              metadata: {
                loadId: load.id,
                documentType: doc.type,
                reminderCount: getReminderCount(load.id, doc.type),
              },
            });

            emailsSent++;
          } else if (result.errors && result.errors.length > 0) {
            throw new EmailSendError('Failed to send email', result.errors[0]);
          }
        } catch (error) {
          emailsFailed++;
          failures.push({
            recipient: load.customer.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          // Log the failure
          monitoringService.logEvent({
            type: EmailEventType.FAILED,
            templateName: 'missing-document',
            recipient: load.customer.email,
            error: {
              code: 'EMAIL_SEND_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
              details: error,
            },
            metadata: {
              loadId: load.id,
              documentType: doc.type,
            },
          });

          // Add to retry queue if it's a recoverable error
          if (error instanceof EmailSendError) {
            const emailOptions = {
              to: recipient,
              subject: `Document Required: ${doc.type} for Load ${load.id}`,
              content: '', // Required by EmailOptions type
              templateName: 'missing-document',
              metadata: {
                loadId: load.id,
                documentType: doc.type,
                dueDate: doc.dueDate.toISOString(),
              },
            };

            recoveryService.addToRetryQueue(
              'missing-document-retry',
              emailOptions,
              error,
              'missing-document'
            );
          }
        }
      }
    }

    return {
      success: true,
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