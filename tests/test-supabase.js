import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Print configuration status
console.log('Configuration:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '❌ Missing');

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log('Data:', data);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

async function executeMigration(filePath) {
  try {
    const sql = await fs.readFile(filePath, 'utf8');
    
    const { data, error } = await supabase
      .from('_sql')
      .insert([{ query: sql }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    console.log(`✅ Successfully applied migration: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`Migration error: ${error.message}`);
    return false;
  }
}

async function verifyTables() {
  console.log('\nVerifying database state:');
  const tables = ['teams', 'team_members', 'loads', 'documents', 'profiles'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}' verification failed: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    } catch (error) {
      console.log(`❌ Table '${table}' verification failed: ${error.message}`);
    }
  }
}

async function verifyPolicies() {
  try {
    const { data, error } = await supabase
      .from('_sql')
      .insert([{
        query: `
          SELECT tablename, policyname, permissive, roles, cmd
          FROM pg_policies
          WHERE schemaname = 'public'
        `
      }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    console.log('\nPolicy Verification:');
    if (data && data.length > 0) {
      data.forEach(policy => {
        console.log(`✅ ${policy.tablename}: ${policy.policyname}`);
      });
    } else {
      console.log('❌ No RLS policies found');
    }
  } catch (error) {
    console.log('Failed to verify policies:', error.message);
  }
}

async function main() {
  const connected = await testSupabaseConnection();
  if (!connected) {
    process.exit(1);
  }

  console.log('\nStarting migration process...');
  const migrationsDir = path.join(__dirname, 'backend', 'supabase', 'migrations');
  
  try {
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('Starting migrations...\n');
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Applying migration: ${file}`);
      await executeMigration(filePath);
    }

    console.log('\nMigrations completed!');
    
    await verifyTables();
    await verifyPolicies();

    console.log('\nMigration Summary:');
    console.log('------------------');
    console.log('Tables:');
    const tables = ['teams', 'team_members', 'loads', 'documents', 'profiles'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${table} (${error.message})`);
        } else {
          console.log(`✅ ${table}`);
        }
      } catch (error) {
        console.log(`❌ ${table} (${error.message})`);
      }
    }

    const { data: policies, error: policiesError } = await supabase
      .from('_sql')
      .insert([{
        query: `
          SELECT COUNT(*) as policy_count
          FROM pg_policies
          WHERE schemaname = 'public'
        `
      }])
      .select();

    if (policiesError) {
      console.log('\nPolicies: ❌ Verification failed');
    } else {
      console.log('\nPolicies:', `✅ ${policies[0].policy_count} policies found`);
    }

  } catch (error) {
    console.error('Migration process failed:', error.message);
    process.exit(1);
  }
}

main(); 