import { EmailTemplate, TEMPLATE_VERSIONS } from '../types';
import { baseTemplate } from './base';

/**
 * Template for document uploaded notification emails
 */
export const documentUploadedTemplate: EmailTemplate = {
  type: 'document-uploaded',
  to: '{{recipientEmail}}',
  subject: 'New Document Uploaded: {{documentName}}',
  html: baseTemplate({
    content: `
      <h2>New Document Uploaded</h2>
      <p>Hello {{recipientName}},</p>
      <p>A new document has been uploaded to your load:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Document:</strong> {{documentName}}</p>
        <p><strong>Type:</strong> {{documentType}}</p>
        <p><strong>Load ID:</strong> {{loadId}}{{#if loadReference}} ({{loadReference}}){{/if}}</p>
        <p><strong>Uploaded by:</strong> {{uploadedBy}}</p>
        <p><strong>Upload date:</strong> {{uploadDate}}</p>
      </div>

      <p>You can view the document by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{documentUrl}}" class="button">
          View Document
        </a>
      </div>

      <p>If you have any questions about this document, please contact your team administrator.</p>
      
      <p>Best regards,<br>The {{app.name}} Team</p>
    `,
    title: 'New Document Uploaded',
    unsubscribeUrl: '{{unsubscribeUrl}}'
  }),
  version: TEMPLATE_VERSIONS['document-uploaded'],
  metadata: {
    template: 'document-uploaded',
    variables: {
      documentName: 'string',
      documentType: 'string',
      recipientName: 'string',
      recipientEmail: 'string',
      documentUrl: 'string',
      loadId: 'string',
      loadReference: 'string?',
      uploadedBy: 'string',
      uploadDate: 'string',
      app: {
        name: 'string'
      },
      unsubscribeUrl: 'string?'
    }
  }
}; 