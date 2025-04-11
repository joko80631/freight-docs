import { EmailTemplate, TEMPLATE_VERSIONS } from '../types';
import { baseTemplate } from './base';

export const loadStatusTemplate: EmailTemplate = {
  type: 'load-status',
  to: '{{recipientEmail}}',
  subject: 'Load #{{loadNumber}} Status Updated to {{status}}',
  html: baseTemplate({
    content: `
      <h2>Load Status Update</h2>
      <p>The status of Load #{{loadNumber}} has been updated to <strong>{{status}}</strong>.</p>
      
      <div style="margin: 20px 0;">
        <p><strong>Update Details:</strong></p>
        <ul>
          <li>Load Number: {{loadNumber}}</li>
          <li>New Status: {{status}}</li>
          <li>Updated by: {{updatedBy}}</li>
          {{#if details}}<li>Details: {{details}}</li>{{/if}}
        </ul>
      </div>

      <div style="margin: 20px 0;">
        <a href="{{loadUrl}}" class="button">
          View Load Details
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        Please review the load details and take any necessary actions.
      </p>
    `,
    title: 'Load Status Update',
    unsubscribeUrl: '{{unsubscribeUrl}}'
  }),
  version: TEMPLATE_VERSIONS['load-status'],
  metadata: {
    template: 'load-status',
    variables: {
      loadNumber: 'string',
      status: 'string',
      updatedBy: 'string',
      details: 'string?',
      loadUrl: 'string',
      recipientEmail: 'string',
      unsubscribeUrl: 'string?'
    }
  }
}; 