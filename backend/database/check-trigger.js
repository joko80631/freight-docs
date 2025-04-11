import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.test') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTriggerSetup() {
  console.log('Checking trigger setup...\n');

  try {
    // Check if the profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('Error checking profiles table:', profilesError.message);
    } else {
      console.log('✅ Profiles table exists');
    }

    // Try to create a test user to see if the trigger works
    console.log('\nCreating test user to check trigger...');
    const testEmail = `test-${Date.now()}@freighttracker.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Test123!',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });

    if (signUpError) {
      console.error('Error creating test user:', signUpError.message);
    } else {
      console.log('✅ Test user created successfully');
      
      // Wait a bit for the trigger to fire
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if the profile was created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError) {
        console.error('Error checking profile:', profileError.message);
      } else if (profile) {
        console.log('✅ Profile was created by trigger');
        console.log('Profile data:', profile);
      } else {
        console.log('❌ Profile was not created by trigger');
      }
    }

  } catch (error) {
    console.error('Error checking trigger setup:', error.message);
    process.exit(1);
  }
}

checkTriggerSetup(); 