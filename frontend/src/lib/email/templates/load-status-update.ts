import { EmailTemplate, TEMPLATE_VERSIONS } from '../types';
import { baseTemplate } from './base';

/**
 * Template for load status update notification emails
 */
export const loadStatusUpdateTemplate: EmailTemplate = {
  type: 'load-status-update',
  to: '{{recipientEmail}}',
  subject: 'Load Status Update: {{loadReference}} - {{status}}',
  html: baseTemplate({
    content: `
      <h2>Load Status Update</h2>
      <p>Hello {{recipientName}},</p>
      <p>The status of your load has been updated:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Load ID:</strong> {{loadId}}</p>
        <p><strong>Reference:</strong> {{loadReference}}</p>
        <p><strong>Previous Status:</strong> {{previousStatus}}</p>
        <p><strong>New Status:</strong> {{status}}</p>
        <p><strong>Update Date:</strong> {{updateDate}}</p>
        {{#if location}}<p><strong>Current Location:</strong> {{location}}</p>{{/if}}
        {{#if estimatedArrival}}<p><strong>Estimated Arrival:</strong> {{estimatedArrival}}</p>{{/if}}
      </div>

      <p>You can view the load details by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{loadUrl}}" class="button">
          View Load
        </a>
      </div>

      <p>If you have any questions about this status update, please contact your team administrator.</p>
      
      <p>Best regards,<br>The {{app.name}} Team</p>
    `,
    title: 'Load Status Update',
    unsubscribeUrl: '{{unsubscribeUrl}}'
  }),
  version: TEMPLATE_VERSIONS['load-status-update'],
  metadata: {
    template: 'load-status-update',
    variables: {
      loadId: 'string',
      loadReference: 'string',
      status: 'string',
      recipientName: 'string',
      recipientEmail: 'string',
      loadUrl: 'string',
      previousStatus: 'string',
      updateDate: 'string',
      location: 'string?',
      estimatedArrival: 'string?',
      app: {
        name: 'string'
      },
      unsubscribeUrl: 'string?'
    }
  }
}; 