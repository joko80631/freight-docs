import { RenderedEmailTemplate, BaseTemplateData, TEMPLATE_VERSIONS } from './index';

interface DocumentUploadData extends BaseTemplateData {
  documentType: string;
  uploadedBy: string;
  documentUrl: string;
  loadNumber?: string;
  dueDate?: string;
}

export async function documentUploadTemplate(data: DocumentUploadData): Promise<RenderedEmailTemplate> {
  const {
    documentType,
    uploadedBy,
    documentUrl,
    loadNumber,
    dueDate,
  } = data;

  const loadInfo = loadNumber ? `for Load #${loadNumber}` : '';
  const dueInfo = dueDate ? ` (Due: ${dueDate})` : '';
  
  const subject = `New ${documentType} Document Uploaded ${loadInfo}`;
  
  const html = `
    <h2>New Document Upload</h2>
    <p>A new ${documentType} document has been uploaded ${loadInfo}${dueInfo}.</p>
    
    <div style="margin: 20px 0;">
      <p><strong>Document Details:</strong></p>
      <ul>
        <li>Type: ${documentType}</li>
        <li>Uploaded by: ${uploadedBy}</li>
        ${loadNumber ? `<li>Load Number: ${loadNumber}</li>` : ''}
        ${dueDate ? `<li>Due Date: ${dueDate}</li>` : ''}
      </ul>
    </div>

    <div style="margin: 20px 0;">
      <a href="${documentUrl}" style="
        display: inline-block;
        background-color: #0070f3;
        color: white;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-weight: 500;
      ">
        View Document
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      Please review the document and take any necessary actions.
    </p>
  `;

  return { 
    subject, 
    html,
    version: TEMPLATE_VERSIONS['document-upload']
  };
} 