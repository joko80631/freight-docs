import { EmailTemplate, TEMPLATE_VERSIONS } from './types';
import { baseTemplate } from './base';

export const missingDocumentTemplate: EmailTemplate = {
  type: 'missing-document',
  to: '{{user.email}}',
  subject: 'Missing Document Required for {{shipment.id}}',
  html: baseTemplate({
    content: `
      <h1>Missing Document Required</h1>
      <p>Hello {{user.name}},</p>
      <p>We noticed that the following document is missing for shipment {{shipment.id}}:</p>
      <ul>
        {{#each shipment.missingDocuments}}
          <li>{{this}}</li>
        {{/each}}
      </ul>
      <p>Please upload the missing document(s) as soon as possible to avoid any delays.</p>
      <p>Due date: {{shipment.dueDate}}</p>
      <p>
        <a href="{{app.url}}/shipments/{{shipment.id}}/documents" class="button">
          Upload Document
        </a>
      </p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The {{app.name}} Team</p>
    `,
    title: 'Missing Document Required',
    unsubscribeUrl: '{{unsubscribeUrl}}'
  }),
  version: TEMPLATE_VERSIONS['missing-document'],
  metadata: {
    template: 'missing-document',
    variables: {
      shipment: {
        id: 'string',
        missingDocuments: 'string[]',
        dueDate: 'string'
      },
      user: {
        name: 'string',
        email: 'string'
      },
      app: {
        name: 'string',
        url: 'string'
      },
      unsubscribeUrl: 'string'
    }
  }
}; 