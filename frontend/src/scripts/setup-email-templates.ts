import { createClient } from '@supabase/supabase-js';
import { missingDocumentsReminderTemplate } from '../lib/email/templates/missing-documents-reminder';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function setupEmailTemplates() {
  try {
    // Check if template already exists
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('email_templates')
      .select('id')
      .eq('id', missingDocumentsReminderTemplate.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingTemplate) {
      // Update existing template
      const { error: updateError } = await supabase
        .from('email_templates')
        .update({
          name: missingDocumentsReminderTemplate.name,
          subject: missingDocumentsReminderTemplate.subject,
          content: missingDocumentsReminderTemplate.content,
          category: missingDocumentsReminderTemplate.category,
          description: missingDocumentsReminderTemplate.description,
          variables: missingDocumentsReminderTemplate.variables,
          updatedAt: new Date(),
        })
        .eq('id', missingDocumentsReminderTemplate.id);

      if (updateError) {
        throw updateError;
      }

      console.log('Updated missing documents reminder template');
    } else {
      // Create new template
      const { error: insertError } = await supabase
        .from('email_templates')
        .insert(missingDocumentsReminderTemplate);

      if (insertError) {
        throw insertError;
      }

      console.log('Created missing documents reminder template');
    }
  } catch (error) {
    console.error('Error setting up email templates:', error);
    process.exit(1);
  }
}

// Run the setup
setupEmailTemplates(); 