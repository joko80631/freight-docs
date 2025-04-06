/**
 * Template for team role update notification emails
 */
export function teamRoleUpdateTemplate(data: {
  teamName: string;
  recipientName: string;
  newRole: string;
  previousRole: string;
  updatedBy: string;
  updateDate: string;
  teamUrl: string;
}): string {
  const { 
    teamName, 
    recipientName, 
    newRole, 
    previousRole, 
    updatedBy, 
    updateDate,
    teamUrl 
  } = data;
  
  const formattedDate = new Date(updateDate).toLocaleDateString();

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Team Role Update</h2>
      <p>Hello ${recipientName},</p>
      <p>Your role in the team has been updated:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Team:</strong> ${teamName}</p>
        <p><strong>Previous Role:</strong> ${previousRole}</p>
        <p><strong>New Role:</strong> ${newRole}</p>
        <p><strong>Updated by:</strong> ${updatedBy}</p>
        <p><strong>Update Date:</strong> ${formattedDate}</p>
      </div>

      <p>You can access your team settings by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${teamUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Team Settings
        </a>
      </div>

      <p>If you have any questions about your role update, please contact your team administrator.</p>
      
      <p>Best regards,<br>The Freight Document Platform Team</p>
    </div>
  `;
} 