import { EmailTemplate, TEMPLATE_VERSIONS } from '../types';
import { baseTemplate } from './base';

export const missingDocumentsReminderTemplate: EmailTemplate = {
  type: 'missing-documents-reminder',
  to: '{{recipient.email}}',
  subject: 'Action Required: Missing Documents for Shipment {{shipment.reference}}',
  html: baseTemplate({
    content: `
      <h2>Missing Documents Reminder</h2>
      
      <p>Dear {{recipient.name}},</p>
      
      <p>This is a reminder that we are still waiting for some required documents for your shipment <strong>{{shipment.reference}}</strong>. These documents are necessary to proceed with the shipment process.</p>
      
      <h3>Missing Documents:</h3>
      <ul class="document-list" style="list-style-type: none; padding: 0;">
        {{#each shipment.missingDocuments}}
          <li style="padding: 10px; margin: 5px 0; background-color: #f8f9fa; border-radius: 3px;">{{this}}</li>
        {{/each}}
      </ul>
      
      <p>Please upload these documents as soon as possible to avoid any delays in your shipment. You can upload the documents through our platform by clicking the button below:</p>
      
      <a href="{{app.url}}/shipments/{{shipment.id}}/documents" class="button">Upload Documents</a>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The {{app.name}} Team</p>
    `,
    title: 'Missing Documents Reminder',
    unsubscribeUrl: '{{unsubscribeUrl}}'
  }),
  version: TEMPLATE_VERSIONS['missing-document'],
  metadata: {
    template: 'missing-documents-reminder',
    variables: {
      recipient: {
        name: 'string',
        email: 'string'
      },
      shipment: {
        id: 'string',
        reference: 'string',
        missingDocuments: 'string[]',
        dueDate: 'string?'
      },
      app: {
        name: 'string',
        url: 'string'
      },
      unsubscribeUrl: 'string'
    }
  }
}; 