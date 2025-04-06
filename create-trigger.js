import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.test') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTrigger() {
  console.log('Creating trigger...\n');

  try {
    // Read the SQL file
    const sql = fs.readFileSync(join(__dirname, 'create-trigger.sql'), 'utf8');

    // Execute the SQL query
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      throw error;
    }

    console.log('✅ Trigger created successfully');

    // Test the trigger
    console.log('\nTesting trigger...');
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
      throw signUpError;
    }

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
      throw profileError;
    }

    if (profile) {
      console.log('✅ Profile was created by trigger');
      console.log('Profile data:', profile);
    } else {
      console.log('❌ Profile was not created by trigger');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTrigger(); 