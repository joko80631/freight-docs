/**
 * Template for load status update notification emails
 */
export function loadStatusUpdateTemplate(data: {
  loadId: string;
  loadReference: string;
  status: string;
  recipientName: string;
  loadUrl: string;
  previousStatus: string;
  updateDate: string;
  location?: string;
  estimatedArrival?: string;
}): string {
  const { 
    loadId, 
    loadReference, 
    status, 
    recipientName, 
    loadUrl, 
    previousStatus, 
    updateDate,
    location,
    estimatedArrival 
  } = data;
  
  const formattedUpdateDate = new Date(updateDate).toLocaleDateString();
  const formattedArrival = estimatedArrival 
    ? new Date(estimatedArrival).toLocaleDateString() 
    : undefined;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Load Status Update</h2>
      <p>Hello ${recipientName},</p>
      <p>The status of your load has been updated:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Load ID:</strong> ${loadId}</p>
        <p><strong>Reference:</strong> ${loadReference}</p>
        <p><strong>Previous Status:</strong> ${previousStatus}</p>
        <p><strong>New Status:</strong> ${status}</p>
        <p><strong>Update Date:</strong> ${formattedUpdateDate}</p>
        ${location ? `<p><strong>Current Location:</strong> ${location}</p>` : ''}
        ${formattedArrival ? `<p><strong>Estimated Arrival:</strong> ${formattedArrival}</p>` : ''}
      </div>

      <p>You can view the load details by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loadUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Load
        </a>
      </div>

      <p>If you have any questions about this status update, please contact your team administrator.</p>
      
      <p>Best regards,<br>The Freight Document Platform Team</p>
    </div>
  `;
} 