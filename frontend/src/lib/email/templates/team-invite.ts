import { EmailTemplate, BaseTemplateData, TEMPLATE_VERSIONS } from './index';

interface TeamInviteData extends BaseTemplateData {
  teamName: string;
  inviterName: string;
  inviteUrl: string;
  role?: string;
  recipientName?: string;
  expiresIn?: string;
}

export async function teamInviteTemplate(data: TeamInviteData): Promise<EmailTemplate> {
  const {
    teamName,
    inviterName,
    inviteUrl,
    role,
    recipientName,
    expiresIn,
  } = data;

  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,';
  
  const subject = `Invitation to Join ${teamName} on Freight Document Platform`;
  
  const html = `
    <h2>Team Invitation</h2>
    <p>${greeting}</p>
    
    <p>${inviterName} has invited you to join <strong>${teamName}</strong>${role ? ` as a ${role}` : ''}.</p>
    
    <div style="margin: 20px 0;">
      <p><strong>Invitation Details:</strong></p>
      <ul>
        <li>Team: ${teamName}</li>
        ${role ? `<li>Role: ${role}</li>` : ''}
        <li>Invited by: ${inviterName}</li>
        ${expiresIn ? `<li>Expires: ${expiresIn}</li>` : ''}
      </ul>
    </div>

    <div style="margin: 20px 0;">
      <a href="${inviteUrl}" style="
        display: inline-block;
        background-color: #0070f3;
        color: white;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-weight: 500;
      ">
        Accept Invitation
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      If you did not expect this invitation, you can safely ignore this email.
    </p>
  `;

  return { 
    subject, 
    html,
    version: TEMPLATE_VERSIONS['team-invite']
  };
} 