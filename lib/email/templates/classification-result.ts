/**
 * AI classification result email template
 * @param data Template data with documentName, classification, confidence, recipientName, and documentUrl
 * @returns HTML content for the email
 */
export function classificationResultTemplate(data: {
  documentName: string;
  classification: string;
  confidence: number;
  recipientName?: string;
  documentUrl?: string;
}): string {
  const greeting = data.recipientName ? `Hi ${data.recipientName},` : 'Hello,';
  const confidencePercentage = Math.round(data.confidence * 100);
  
  return `
    <h1>Document Classification Complete</h1>
    
    <p>${greeting}</p>
    
    <p>We've completed the AI classification of your document <strong>${data.documentName}</strong>.</p>
    
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <h2 style="margin-top: 0;">Classification Results</h2>
      <p><strong>Document Type:</strong> ${data.classification}</p>
      <p><strong>Confidence:</strong> ${confidencePercentage}%</p>
    </div>
    
    <p>Our AI system has analyzed your document and classified it as a <strong>${data.classification}</strong> with ${confidencePercentage}% confidence.</p>
    
    ${data.documentUrl ? `
      <div style="text-align: center;">
        <a href="{{documentUrl}}" class="button">View Document</a>
      </div>
    ` : `
      <p>You can view the full document details by logging into your account.</p>
    `}
    
    <p>If you believe this classification is incorrect, you can manually update it in the system.</p>
    
    <p>Best regards,<br>The Freight Document Platform Team</p>
  `;
} 