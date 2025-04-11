import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env.test') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMigrations() {
  console.log('Testing migrations and policies...\n');

  try {
    // Test profiles table
    console.log('1. Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table exists and is accessible');
    }

    // Test teams table
    console.log('\n2. Testing teams table...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(1);
    
    if (teamsError) {
      console.error('❌ Teams table error:', teamsError.message);
    } else {
      console.log('✅ Teams table exists and is accessible');
    }

    // Test team_members table
    console.log('\n3. Testing team_members table...');
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('*')
      .limit(1);
    
    if (teamMembersError) {
      console.error('❌ Team members table error:', teamMembersError.message);
    } else {
      console.log('✅ Team members table exists and is accessible');
    }

    // Test RLS policies
    console.log('\n4. Testing RLS policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'teams', 'team_members')
      `
    });

    if (policiesError) {
      console.error('❌ Error fetching policies:', policiesError.message);
    } else {
      const requiredPolicies = [
        'Users can view their own profile',
        'Users can update their own profile',
        'Users can view teams they are members of',
        'Users can create teams',
        'Users can view team members of their teams',
        'Users can add members to their teams'
      ];

      const missingPolicies = requiredPolicies.filter(
        policy => !policies.some(p => p.policyname === policy)
      );

      if (missingPolicies.length > 0) {
        console.error('❌ Missing policies:', missingPolicies);
      } else {
        console.log('✅ All required RLS policies are present');
      }
    }

    // Test trigger function
    console.log('\n5. Testing user creation trigger...');
    const { data: triggers, error: triggersError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT tgname, tgrelid::regclass
        FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
      `
    });

    if (triggersError) {
      console.error('❌ Error fetching triggers:', triggersError.message);
    } else if (!triggers || triggers.length === 0) {
      console.error('❌ User creation trigger is missing');
    } else {
      console.log('✅ User creation trigger is present');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMigrations(); 