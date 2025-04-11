import { EmailTemplate, TEMPLATE_VERSIONS } from '../types';
import { baseTemplate } from './base';

/**
 * AI classification result email template
 * @param data Template data with documentName, classification, confidence, recipientName, and documentUrl
 * @returns HTML content for the email
 */
export const classificationResultTemplate: EmailTemplate = {
  type: 'classification-result',
  to: '{{recipientEmail}}',
  subject: 'Document Classification Complete: {{documentName}}',
  html: baseTemplate({
    content: `
      <h1>Document Classification Complete</h1>
      
      <p>{{#if recipientName}}Hi {{recipientName}},{{else}}Hello,{{/if}}</p>
      
      <p>We've completed the AI classification of your document <strong>{{documentName}}</strong>.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Classification Results</h2>
        <p><strong>Document Type:</strong> {{classification}}</p>
        <p><strong>Confidence:</strong> {{confidence}}%</p>
      </div>
      
      <p>Our AI system has analyzed your document and classified it as a <strong>{{classification}}</strong> with {{confidence}}% confidence.</p>
      
      {{#if documentUrl}}
        <div style="text-align: center;">
          <a href="{{documentUrl}}" class="button">View Document</a>
        </div>
      {{else}}
        <p>You can view the full document details by logging into your account.</p>
      {{/if}}
      
      <p>If you believe this classification is incorrect, you can manually update it in the system.</p>
      
      <p>Best regards,<br>The {{app.name}} Team</p>
    `,
    title: 'Document Classification Complete',
    unsubscribeUrl: '{{unsubscribeUrl}}'
  }),
  version: TEMPLATE_VERSIONS['classification-result'],
  metadata: {
    template: 'classification-result',
    variables: {
      documentName: 'string',
      classification: 'string',
      confidence: 'number',
      recipientName: 'string?',
      recipientEmail: 'string',
      documentUrl: 'string?',
      app: {
        name: 'string'
      },
      unsubscribeUrl: 'string?'
    }
  }
}; 