import { EmailTemplate, TEMPLATE_VERSIONS } from '../types';
import { baseTemplate } from './base';

export const teamInviteTemplate: EmailTemplate = {
  type: 'team-invite',
  to: '{{recipientEmail}}',
  subject: 'Invitation to Join {{teamName}} on {{app.name}}',
  html: baseTemplate({
    content: `
      <h2>Team Invitation</h2>
      <p>{{#if recipientName}}Hi {{recipientName}},{{else}}Hi,{{/if}}</p>
      
      <p>{{inviterName}} has invited you to join <strong>{{teamName}}</strong>{{#if role}} as a {{role}}{{/if}}.</p>
      
      <div style="margin: 20px 0;">
        <p><strong>Invitation Details:</strong></p>
        <ul>
          <li>Team: {{teamName}}</li>
          {{#if role}}<li>Role: {{role}}</li>{{/if}}
          <li>Invited by: {{inviterName}}</li>
          {{#if expiresIn}}<li>Expires: {{expiresIn}}</li>{{/if}}
        </ul>
      </div>

      <div style="margin: 20px 0;">
        <a href="{{inviteUrl}}" class="button">
          Accept Invitation
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        If you did not expect this invitation, you can safely ignore this email.
      </p>
    `,
    title: 'Team Invitation',
    unsubscribeUrl: '{{unsubscribeUrl}}'
  }),
  version: TEMPLATE_VERSIONS['team-invite'],
  metadata: {
    template: 'team-invite',
    variables: {
      teamName: 'string',
      inviterName: 'string',
      inviteUrl: 'string',
      role: 'string?',
      recipientName: 'string?',
      recipientEmail: 'string',
      expiresIn: 'string?',
      app: {
        name: 'string'
      },
      unsubscribeUrl: 'string?'
    }
  }
}; 