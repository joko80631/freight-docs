import { EmailTemplate, TEMPLATE_VERSIONS } from '../types';
import { baseTemplate } from './base';

export const documentUploadTemplate: EmailTemplate = {
  type: 'document-upload',
  to: '{{recipientEmail}}',
  subject: 'New {{documentType}} Document Uploaded{{#if loadNumber}} for Load {{loadNumber}}{{/if}}',
  html: baseTemplate({
    content: `
      <h2>New Document Upload</h2>
      <p>A new {{documentType}} document has been uploaded{{#if loadNumber}} for Load {{loadNumber}}{{/if}}{{#if dueDate}} (Due: {{dueDate}}){{/if}}.</p>
      
      <div style="margin: 20px 0;">
        <p><strong>Document Details:</strong></p>
        <ul>
          <li>Type: {{documentType}}</li>
          <li>Uploaded by: {{uploadedBy}}</li>
          {{#if loadNumber}}<li>Load Number: {{loadNumber}}</li>{{/if}}
          {{#if dueDate}}<li>Due Date: {{dueDate}}</li>{{/if}}
        </ul>
      </div>

      <div style="margin: 20px 0;">
        <a href="{{documentUrl}}" class="button">
          View Document
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        Please review the document and take any necessary actions.
      </p>
    `,
    title: 'New Document Upload',
    unsubscribeUrl: '{{unsubscribeUrl}}'
  }),
  version: TEMPLATE_VERSIONS['document-upload'],
  metadata: {
    template: 'document-upload',
    variables: {
      documentType: 'string',
      uploadedBy: 'string',
      documentUrl: 'string',
      loadNumber: 'string?',
      dueDate: 'string?',
      recipientEmail: 'string',
      unsubscribeUrl: 'string?'
    }
  }
}; 