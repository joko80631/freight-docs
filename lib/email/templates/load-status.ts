import { EmailTemplate, TemplateData } from './index';

interface LoadStatusData extends TemplateData {
  loadNumber: string;
  status: string;
  updatedBy: string;
  details?: string;
  loadUrl: string;
  recipientName?: string;
}

export async function loadStatusTemplate(data: LoadStatusData): Promise<EmailTemplate> {
  const {
    loadNumber,
    status,
    updatedBy,
    details,
    loadUrl,
    recipientName,
  } = data;

  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,';
  
  const subject = `Load #${loadNumber} Status Update: ${status}`;
  
  const html = `
    <h2>Load Status Update</h2>
    <p>${greeting}</p>
    
    <p>The status of Load #${loadNumber} has been updated to <strong>${status}</strong> by ${updatedBy}.</p>
    
    <div style="margin: 20px 0;">
      <p><strong>Update Details:</strong></p>
      <ul>
        <li>Load Number: ${loadNumber}</li>
        <li>New Status: ${status}</li>
        <li>Updated by: ${updatedBy}</li>
        ${details ? `<li>Additional Details: ${details}</li>` : ''}
      </ul>
    </div>

    <div style="margin: 20px 0;">
      <a href="${loadUrl}" style="
        display: inline-block;
        background-color: #0070f3;
        color: white;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-weight: 500;
      ">
        View Load Details
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      You can view the complete load details and history by clicking the button above.
    </p>
  `;

  return { subject, html };
} 