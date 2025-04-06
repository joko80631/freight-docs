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

async function checkProfile(userId, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Checking profile (attempt ${i + 1}/${maxAttempts})...`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    if (error) {
      console.error('Error checking profile:', error.message);
    } else if (data && data.length > 0) {
      return data[0];
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return null;
}

async function checkUser() {
  console.log('Checking user data...\n');

  try {
    // Create a test user
    console.log('Creating test user...');
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
    console.log('User ID:', signUpData.user.id);
    console.log('User email:', signUpData.user.email);
    console.log('User metadata:', signUpData.user.user_metadata);

    // Check for profile with retries
    console.log('\nChecking for profile...');
    const profile = await checkProfile(signUpData.user.id);

    if (profile) {
      console.log('✅ Profile exists:');
      console.log(profile);
    } else {
      console.log('❌ Profile does not exist after multiple attempts');

      // Try to create the profile manually only if it doesn't exist
      console.log('\nTrying to create profile manually...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          email: signUpData.user.email,
          full_name: signUpData.user.user_metadata.full_name || 'Test User'
        });

      if (insertError) {
        if (insertError.message.includes('duplicate key')) {
          console.log('Profile was created by trigger between our last check and insert attempt');
          const finalProfile = await checkProfile(signUpData.user.id, 1);
          if (finalProfile) {
            console.log('✅ Found the profile:');
            console.log(finalProfile);
          }
        } else {
          console.error('Error creating profile:', insertError.message);
        }
      } else {
        console.log('✅ Profile created manually');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUser(); 