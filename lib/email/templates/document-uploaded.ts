/**
 * Template for document uploaded notification emails
 */
export function documentUploadedTemplate(data: {
  documentName: string;
  documentType: string;
  recipientName: string;
  documentUrl: string;
  loadId: string;
  loadReference?: string;
  uploadedBy: string;
  uploadDate: string;
}): string {
  const { documentName, documentType, recipientName, documentUrl, loadId, loadReference, uploadedBy, uploadDate } = data;
  const formattedDate = new Date(uploadDate).toLocaleDateString();

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Document Uploaded</h2>
      <p>Hello ${recipientName},</p>
      <p>A new document has been uploaded to your load:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Document:</strong> ${documentName}</p>
        <p><strong>Type:</strong> ${documentType}</p>
        <p><strong>Load ID:</strong> ${loadId}${loadReference ? ` (${loadReference})` : ''}</p>
        <p><strong>Uploaded by:</strong> ${uploadedBy}</p>
        <p><strong>Upload date:</strong> ${formattedDate}</p>
      </div>

      <p>You can view the document by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${documentUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Document
        </a>
      </div>

      <p>If you have any questions about this document, please contact your team administrator.</p>
      
      <p>Best regards,<br>The Freight Document Platform Team</p>
    </div>
  `;
} 