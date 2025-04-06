import { RenderedEmailTemplate, BaseTemplateData, TEMPLATE_VERSIONS } from './index';

interface LoadStatusData extends BaseTemplateData {
  loadNumber: string;
  status: string;
  updatedBy: string;
  details?: string;
  loadUrl: string;
}

export async function loadStatusTemplate(data: LoadStatusData): Promise<RenderedEmailTemplate> {
  const {
    loadNumber,
    status,
    updatedBy,
    details,
    loadUrl,
  } = data;

  const subject = `Load #${loadNumber} Status Updated to ${status}`;
  
  const html = `
    <h2>Load Status Update</h2>
    <p>The status of Load #${loadNumber} has been updated to <strong>${status}</strong>.</p>
    
    <div style="margin: 20px 0;">
      <p><strong>Update Details:</strong></p>
      <ul>
        <li>Load Number: ${loadNumber}</li>
        <li>New Status: ${status}</li>
        <li>Updated by: ${updatedBy}</li>
        ${details ? `<li>Details: ${details}</li>` : ''}
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
      Please review the load details and take any necessary actions.
    </p>
  `;

  return { 
    subject, 
    html,
    version: TEMPLATE_VERSIONS['load-status']
  };
} 