import { RenderedEmailTemplate, BaseTemplateData, TEMPLATE_VERSIONS } from './index';

interface MissingDocumentData extends BaseTemplateData {
  documentType: string;
  dueDate: string;
  loadNumber?: string;
  uploadUrl: string;
}

export async function missingDocumentTemplate(data: MissingDocumentData): Promise<RenderedEmailTemplate> {
  const {
    documentType,
    dueDate,
    loadNumber,
    uploadUrl,
  } = data;

  const loadInfo = loadNumber ? `for Load #${loadNumber}` : '';
  const subject = `Missing ${documentType} Document ${loadInfo}`;
  
  const html = `
    <h2>Missing Document Notice</h2>
    <p>A ${documentType} document is required ${loadInfo}.</p>
    
    <div style="margin: 20px 0;">
      <p><strong>Document Details:</strong></p>
      <ul>
        <li>Document Type: ${documentType}</li>
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
      Please upload the required document before the due date to avoid any delays.
    </p>
  `;

  return { 
    subject, 
    html,
    version: TEMPLATE_VERSIONS['missing-document']
  };
} 