import { EmailTemplate, TemplateData } from './index';
import { TEMPLATE_VERSIONS } from './types';

interface MissingDocumentData extends TemplateData {
  documentType: string;
  dueDate: string;
  loadNumber?: string;
  recipientName?: string;
  uploadUrl: string;
}

export async function missingDocumentTemplate(data: MissingDocumentData): Promise<EmailTemplate> {
  const {
    documentType,
    dueDate,
    loadNumber,
    recipientName,
    uploadUrl,
  } = data;

  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,';
  const loadInfo = loadNumber ? ` for Load #${loadNumber}` : '';
  
  const subject = `Missing ${documentType} Document Reminder${loadInfo}`;
  
  const html = `
    <h2>Missing Document Reminder</h2>
    <p>${greeting}</p>
    
    <p>This is a reminder that a ${documentType} document${loadInfo} is required and due by <strong>${dueDate}</strong>.</p>
    
    <div style="margin: 20px 0;">
      <p><strong>Document Details:</strong></p>
      <ul>
        <li>Type: ${documentType}</li>
        <li>Due Date: ${dueDate}</li>
        ${loadNumber ? `<li>Load Number: ${loadNumber}</li>` : ''}
      </ul>
    </div>

    <div style="margin: 20px 0;">
      <a href="${uploadUrl}" style="
        display: inline-block;
        background-color: #0070f3;
        color: white;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-weight: 500;
      ">
        Upload Document
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      Please upload the required document as soon as possible to avoid any delays.
      If you have already uploaded this document, you can ignore this reminder.
    </p>
  `;

  return { 
    subject, 
    html,
    version: TEMPLATE_VERSIONS['missing-document']
  };
} 