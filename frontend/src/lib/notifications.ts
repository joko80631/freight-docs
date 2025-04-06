import { createClient } from '@supabase/supabase-js';
import { sendTemplatedEmail } from './email';
import { EmailRecipient } from './email/types';
import { TemplateName, TemplateData } from './email/templates';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define types for team members
interface TeamMemberProfile {
  id: string;
  email: string;
  full_name: string;
}

interface TeamMember {
  user_id: string;
  profiles: TeamMemberProfile;
}

/**
 * Send a team invitation email
 * @param recipientEmail The email address of the recipient
 * @param inviterName The name of the person sending the invitation
 * @param teamName The name of the team
 * @param inviteToken The secure token for the invitation
 * @param inviterId The ID of the user sending the invitation (for audit logging)
 * @returns Promise that resolves when the email is sent
 */
export async function sendTeamInvite(
  recipientEmail: string,
  inviterName: string,
  teamName: string,
  inviteToken: string,
  inviterId: string
): Promise<void> {
  try {
    // Generate the invitation URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`;
    
    // Get recipient name if available
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('email', recipientEmail)
      .single();
    
    const recipientName = profile?.full_name;
    
    // Send the email using the template
    await sendTemplatedEmail(
      'team-invite' as TemplateName,
      {
        inviterName,
        teamName,
        inviteUrl,
        recipientName,
      } as TemplateData,
      { email: recipientEmail, name: recipientName },
      {
        userId: inviterId,
        category: 'team-invites',
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/preferences?email=${encodeURIComponent(recipientEmail)}`
      }
    );
    
    console.log(`Team invitation sent to ${recipientEmail} for team ${teamName}`);
  } catch (error) {
    console.error('Error sending team invitation:', error);
    // Don't throw the error to prevent breaking the application flow
    // The error will be logged in the email service
  }
}

/**
 * Send a missing document reminder email
 * @param recipientEmail The email address of the recipient
 * @param loadId The ID of the load
 * @param documentType The type of document that is missing
 * @param userId The ID of the user who should receive the reminder (for audit logging)
 * @returns Promise that resolves when the email is sent
 */
export async function sendMissingDocumentReminder(
  recipientEmail: string,
  loadId: string,
  documentType: string,
  userId: string
): Promise<void> {
  try {
    // Get load details
    const { data: load } = await supabase
      .from('loads')
      .select('reference_number, due_date')
      .eq('id', loadId)
      .single();
    
    if (!load) {
      console.error(`Load with ID ${loadId} not found`);
      return;
    }
    
    // Get recipient name if available
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('email', recipientEmail)
      .single();
    
    const recipientName = profile?.full_name;
    
    // Format the due date
    const dueDate = load.due_date 
      ? new Date(load.due_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'as soon as possible';
    
    // Generate the document upload URL
    const documentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/loads/${loadId}/documents/upload?type=${encodeURIComponent(documentType)}`;
    
    // Send the email using the template
    await sendTemplatedEmail(
      'missing-document' as TemplateName,
      {
        documentType,
        dueDate,
        recipientName,
        uploadUrl: documentUrl,
        loadNumber: load.reference_number,
      } as TemplateData,
      { email: recipientEmail, name: recipientName },
      {
        userId,
        category: 'document-reminders',
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/preferences?email=${encodeURIComponent(recipientEmail)}`
      }
    );
    
    console.log(`Missing document reminder sent to ${recipientEmail} for ${documentType} on load ${load.reference_number}`);
  } catch (error) {
    console.error('Error sending missing document reminder:', error);
    // Don't throw the error to prevent breaking the application flow
  }
}

/**
 * Send a classification result email
 * @param recipientEmail The email address of the recipient
 * @param documentId The ID of the document
 * @param classificationResult The classification result object
 * @param userId The ID of the user who should receive the notification (for audit logging)
 * @returns Promise that resolves when the email is sent
 */
export async function sendClassificationResult(
  recipientEmail: string,
  documentId: string,
  classificationResult: {
    documentName: string;
    classification: string;
    confidence: number;
  },
  userId: string
): Promise<void> {
  try {
    // Get recipient name if available
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('email', recipientEmail)
      .single();
    
    const recipientName = profile?.full_name;
    
    // Generate the document view URL
    const documentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/documents/${documentId}`;
    
    // Send the email using the template
    await sendTemplatedEmail(
      'document-upload' as TemplateName,
      {
        documentType: classificationResult.classification,
        uploadedBy: 'AI Classification',
        documentUrl,
        recipientName,
      } as TemplateData,
      { email: recipientEmail, name: recipientName },
      {
        userId,
        category: 'classification-results',
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/preferences?email=${encodeURIComponent(recipientEmail)}`
      }
    );
    
    console.log(`Classification result sent to ${recipientEmail} for document ${classificationResult.documentName}`);
  } catch (error) {
    console.error('Error sending classification result:', error);
    // Don't throw the error to prevent breaking the application flow
  }
}

/**
 * Send a notification to all team members with a specific role
 * @param teamId The ID of the team
 * @param role The role to filter by (e.g., 'admin', 'member')
 * @param templateName The name of the template to use
 * @param data The data to pass to the template
 * @param options Additional options for the email
 * @returns Promise that resolves when all emails are sent
 */
export async function sendTeamNotification(
  teamId: string,
  role: string,
  templateName: string,
  data: Record<string, any>,
  options: {
    subject?: string;
    category?: string;
    excludeUserIds?: string[];
  } = {}
): Promise<void> {
  try {
    // Get all team members with the specified role
    const { data: teamMembers, error } = await supabase
      .from('team_members')
      .select(`
        user_id,
        profiles:profiles (
          id,
          email,
          full_name
        )
      `)
      .eq('team_id', teamId)
      .eq('role', role);
    
    if (error) {
      console.error(`Error fetching team members for team ${teamId}:`, error);
      return;
    }
    
    if (!teamMembers || teamMembers.length === 0) {
      console.log(`No team members found with role ${role} for team ${teamId}`);
      return;
    }
    
    // Send emails to all team members
    const emailPromises = teamMembers
      .filter(member => {
        // Type guard to ensure member has the expected structure
        if (!member || !member.profiles || typeof member.profiles !== 'object') {
          return false;
        }
        
        const profile = member.profiles as unknown as TeamMemberProfile;
        return profile.email && !options.excludeUserIds?.includes(member.user_id);
      })
      .map(member => {
        const profile = member.profiles as unknown as TeamMemberProfile;
        const recipient: EmailRecipient = {
          email: profile.email,
          name: profile.full_name
        };
        
        return sendTemplatedEmail(
          templateName as TemplateName,
          {
            ...data,
            recipientName: profile.full_name
          } as TemplateData,
          recipient,
          {
            subject: options.subject,
            userId: member.user_id,
            category: options.category,
            unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/preferences?email=${encodeURIComponent(profile.email)}`
          }
        );
      });
    
    await Promise.all(emailPromises);
    console.log(`Team notification sent to ${emailPromises.length} team members with role ${role}`);
  } catch (error) {
    console.error('Error sending team notification:', error);
    // Don't throw the error to prevent breaking the application flow
  }
} 