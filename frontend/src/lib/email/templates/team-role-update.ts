import { EmailTemplate, TEMPLATE_VERSIONS } from '../types';
import { baseTemplate } from './base';

/**
 * Template for team role update notification emails
 */
export const teamRoleUpdateTemplate: EmailTemplate = {
  type: 'team-role-update',
  to: '{{recipientEmail}}',
  subject: 'Your Role in {{teamName}} Has Been Updated',
  html: baseTemplate({
    content: `
      <h2>Team Role Update</h2>
      <p>Hello {{recipientName}},</p>
      <p>Your role in the team has been updated:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Team:</strong> {{teamName}}</p>
        <p><strong>Previous Role:</strong> {{previousRole}}</p>
        <p><strong>New Role:</strong> {{newRole}}</p>
        <p><strong>Updated by:</strong> {{updatedBy}}</p>
        <p><strong>Update Date:</strong> {{updateDate}}</p>
      </div>

      <p>You can access your team settings by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{teamUrl}}" class="button">
          View Team Settings
        </a>
      </div>

      <p>If you have any questions about your role update, please contact your team administrator.</p>
      
      <p>Best regards,<br>The {{app.name}} Team</p>
    `,
    title: 'Team Role Update',
    unsubscribeUrl: '{{unsubscribeUrl}}'
  }),
  version: TEMPLATE_VERSIONS['team-role-update'],
  metadata: {
    template: 'team-role-update',
    variables: {
      teamName: 'string',
      recipientName: 'string',
      recipientEmail: 'string',
      newRole: 'string',
      previousRole: 'string',
      updatedBy: 'string',
      updateDate: 'string',
      teamUrl: 'string',
      app: {
        name: 'string'
      },
      unsubscribeUrl: 'string?'
    }
  }
}; 