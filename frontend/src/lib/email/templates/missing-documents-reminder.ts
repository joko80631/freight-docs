import { EmailTemplate } from '../types';

export const missingDocumentsReminderTemplate: EmailTemplate = {
  id: 'missing-documents-reminder',
  name: 'Missing Documents Reminder',
  subject: 'Action Required: Missing Documents for Shipment {{shipment.reference}}',
  content: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Missing Documents Reminder</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .content {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 5px;
          border: 1px solid #e9ecef;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 12px;
          color: #6c757d;
        }
        .document-list {
          list-style-type: none;
          padding: 0;
        }
        .document-item {
          padding: 10px;
          margin: 5px 0;
          background-color: #f8f9fa;
          border-radius: 3px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Missing Documents Reminder</h2>
      </div>
      
      <div class="content">
        <p>Dear {{recipient.name}},</p>
        
        <p>This is a reminder that we are still waiting for some required documents for your shipment <strong>{{shipment.reference}}</strong>. These documents are necessary to proceed with the shipment process.</p>
        
        <h3>Missing Documents:</h3>
        <ul class="document-list">
          {{#each shipment.missingDocuments}}
            <li class="document-item">{{this}}</li>
          {{/each}}
        </ul>
        
        <p>Please upload these documents as soon as possible to avoid any delays in your shipment. You can upload the documents through our platform by clicking the button below:</p>
        
        <a href="{{appUrl}}/shipments/{{shipment.id}}/documents" class="button">Upload Documents</a>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>The Freight Team</p>
      </div>
      
      <div class="footer">
        <p>This email was sent to {{recipient.email}}. If you no longer wish to receive these reminders, you can <a href="{{unsubscribeUrl}}">unsubscribe here</a>.</p>
      </div>
    </body>
    </html>
  `,
  category: 'missing-documents',
  description: 'Sent to remind users about missing documents for their shipments',
  variables: [
    'recipient.name',
    'recipient.email',
    'shipment.id',
    'shipment.reference',
    'shipment.missingDocuments',
    'shipment.dueDate',
    'appUrl',
    'unsubscribeUrl'
  ],
  createdAt: new Date(),
  updatedAt: new Date()
}; 