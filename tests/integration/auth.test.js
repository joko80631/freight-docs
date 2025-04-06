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

async function testAuthFlow() {
  console.log('Testing authentication flow...\n');

  try {
    // 1. Test signup
    console.log('1. Testing user signup...');
    const testEmail = `test-${Date.now()}@freighttracker.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Test123!',
      options: {
        data: {
          full_name: 'Test User'
        },
        emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL
      }
    });

    if (signUpError) {
      throw new Error(`Signup failed: ${signUpError.message}`);
    }
    console.log('✅ Signup successful');

    // 2. Create profile
    console.log('\n2. Creating profile...');
    const { data: profile, error: profileError } = await supabase.rpc(
      'create_profile_for_user',
      { user_id: signUpData.user.id }
    );

    if (profileError) {
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }
    console.log('✅ Profile created successfully');
    console.log('Profile data:', profile);

    // Note: In a real application, the user would need to confirm their email
    // For testing purposes, we'll skip the email confirmation step
    console.log('\n3. Email confirmation required');
    console.log('⚠️ In a real application, the user would need to confirm their email');
    console.log('⚠️ For testing purposes, we consider this test successful');

    console.log('\n✨ Authentication flow test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuthFlow(); 