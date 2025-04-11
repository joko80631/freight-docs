import { sendTemplatedEmail } from '../index';
import { hasEmailOptIn, getNotificationRecipients, EmailPreferenceType } from './preferences';
import { isDuplicateEmail, isRateLimited, isLoadRateLimited } from './deduplication';
import { logEmailActivity } from './audit-log';
import { TEMPLATE_VERSIONS, SpecificTemplateData } from '../templates/types';
import { EmailRecipient } from '../types';

interface NotificationContext {
  recipientId: string;
  recipientEmail: string;
  templateName: keyof typeof TEMPLATE_VERSIONS;
  metadata?: Record<string, any>;
  loadId?: string;
  documentId?: string;
  teamId?: string;
  preferenceType?: EmailPreferenceType;
  data?: SpecificTemplateData;
  excludeUserIds?: string[];
}

/**
 * Centralized function to send notifications with all checks and logging
 */
export async function sendNotification(context: NotificationContext): Promise<{
  success: boolean;
  sent: number;
  skipped: number;
  failed: number;
  details: Array<{
    recipientId: string;
    status: 'sent' | 'skipped' | 'failed';
    reason?: string;
    error?: string;
  }>;
}> {
  const {
    templateName,
    preferenceType = 'all' as EmailPreferenceType,
    data,
    teamId,
    loadId,
    documentId,
    excludeUserIds = [],
    metadata = {},
  } = context;

  // Get all potential recipients
  const recipientIds = await getNotificationRecipients(preferenceType, {
    teamId,
    loadId,
    documentId,
    excludeUserIds,
  });

  if (recipientIds.length === 0) {
    console.log(`No recipients found for notification: ${templateName}`);
    return {
      success: true,
      sent: 0,
      skipped: 0,
      failed: 0,
      details: [],
    };
  }

  // Check load rate limit if applicable
  if (loadId) {
    const loadLimited = await isLoadRateLimited(loadId);
    if (loadLimited) {
      console.log(`Load ${loadId} has reached notification rate limit`);
      
      // Log skipped notification for all recipients
      const details = recipientIds.map(recipientId => ({
        recipientId,
        status: 'skipped' as const,
        reason: 'rate_limited',
      }));
      
      // Log the skipped notification
      await Promise.all(
        details.map(detail => 
          logEmailActivity({
            recipientId: detail.recipientId,
            templateName,
            status: 'skipped',
            metadata: {
              ...metadata,
              loadId,
              reason: 'rate_limited',
            },
          })
        )
      );
      
      return {
        success: true,
        sent: 0,
        skipped: recipientIds.length,
        failed: 0,
        details,
      };
    }
  }

  // Process each recipient
  const results = await Promise.all(
    recipientIds.map(async (recipientId) => {
      // Check user preferences
      const hasOptIn = await hasEmailOptIn(recipientId, preferenceType);
      if (!hasOptIn) {
        await logEmailActivity({
          recipientId,
          templateName,
          status: 'skipped',
          metadata: {
            ...metadata,
            reason: 'preference_disabled',
          },
        });
        
        return {
          recipientId,
          status: 'skipped' as const,
          reason: 'preference_disabled',
        };
      }

      // Check user rate limit
      const userLimited = await isRateLimited(recipientId);
      if (userLimited) {
        await logEmailActivity({
          recipientId,
          templateName,
          status: 'skipped',
          metadata: {
            ...metadata,
            reason: 'user_rate_limited',
          },
        });
        
        return {
          recipientId,
          status: 'skipped' as const,
          reason: 'user_rate_limited',
        };
      }

      // Check for duplicates
      const isDuplicate = await isDuplicateEmail({
        templateName,
        recipientId,
        loadId,
        documentId,
        teamId,
      });
      
      if (isDuplicate) {
        await logEmailActivity({
          recipientId,
          templateName,
          status: 'skipped',
          metadata: {
            ...metadata,
            reason: 'duplicate',
          },
        });
        
        return {
          recipientId,
          status: 'skipped' as const,
          reason: 'duplicate',
        };
      }

      // Send the email
      try {
        if (!data) {
          throw new Error(`Template data is required for template: ${templateName}`);
        }

        const recipient: EmailRecipient = {
          email: context.recipientEmail,
          name: data.recipientName,
        };

        const result = await sendTemplatedEmail(
          templateName,
          data,
          recipient,
          {
            metadata: {
              ...metadata,
              loadId,
              documentId,
              teamId,
            },
          }
        );

        if (result.success) {
          await logEmailActivity({
            recipientId,
            templateName,
            status: 'success',
            metadata: {
              ...metadata,
              loadId,
              documentId,
              teamId,
            },
          });
          return {
            recipientId,
            status: 'sent' as const,
          };
        } else {
          await logEmailActivity({
            recipientId,
            templateName,
            status: 'failure',
            error: result.errors?.[0]?.message,
            metadata: {
              ...metadata,
              loadId,
              documentId,
              teamId,
              errors: result.errors,
            },
          });
          return {
            recipientId,
            status: 'failed' as const,
            error: result.errors?.[0]?.message,
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        await logEmailActivity({
          recipientId,
          templateName,
          status: 'failure',
          error: errorMessage,
          metadata: {
            ...metadata,
            loadId,
            documentId,
            teamId,
          },
        });
        
        return {
          recipientId,
          status: 'failed' as const,
          error: errorMessage,
        };
      }
    })
  );

  // Count results
  const sent = results.filter(r => r.status === 'sent').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const failed = results.filter(r => r.status === 'failed').length;

  return {
    success: failed === 0,
    sent,
    skipped,
    failed,
    details: results,
  };
} 