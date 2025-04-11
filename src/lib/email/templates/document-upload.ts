import { EmailTemplate, TEMPLATE_VERSIONS } from './types';
import { baseTemplate } from './base';
import { DocumentUploadData } from './index';

export const documentUploadTemplate: EmailTemplate = {
  type: 'document-upload',
  to: '{{recipientEmail}}',
  subject: 'New {{documentType}} Document Uploaded{{#if loadNumber}} for Load {{loadNumber}}{{/if}}',
  html: baseTemplate({
    content: `
      <h2>New Document Uploaded</h2>
      <p>A new {{documentType}} document has been uploaded{{#if loadNumber}} for Load {{loadNumber}}{{/if}}.</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <p><strong>Document Type:</strong> {{documentType}}</p>
        <p><strong>Uploaded By:</strong> {{uploadedBy}}</p>
        {{#if loadNumber}}<p><strong>Load Number:</strong> {{loadNumber}}</p>{{/if}}
        {{#if dueDate}}<p><strong>Due Date:</strong> {{dueDate}}</p>{{/if}}
      </div>

      <div style="margin: 20px 0;">
        <a href="{{documentUrl}}" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          View Document
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        If you have any questions, please contact your team administrator.
      </p>
    `,
    title: 'New Document Uploaded',
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