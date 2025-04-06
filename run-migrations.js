import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigrations() {
  console.log('Running migrations...\n');

  try {
    // Skip initial setup since it's already done through the dashboard
    console.log('1. Skipping initial setup (already done through dashboard)');

    // Read and execute base tables migration
    console.log('\n2. Running base tables migration...');
    const baseTablesSql = await fs.readFile(
      join(__dirname, 'supabase/migrations/20240319000000_base_tables.sql'),
      'utf8'
    );
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: baseTablesSql
      });

      if (error) {
        console.error('❌ Base tables migration error:', error.message);
        return;
      }
      console.log('✅ Base tables migration completed');
    } catch (error) {
      console.error('❌ Base tables migration error:', error.message);
      return;
    }

    // Read and execute documents bucket migration
    console.log('\n3. Running documents bucket migration...');
    const documentsBucketSql = await fs.readFile(
      join(__dirname, 'supabase/migrations/20240320000000_create_documents_bucket.sql'),
      'utf8'
    );
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: documentsBucketSql
      });

      if (error) {
        console.error('❌ Documents bucket migration error:', error.message);
        return;
      }
      console.log('✅ Documents bucket migration completed');
    } catch (error) {
      console.error('❌ Documents bucket migration error:', error.message);
      return;
    }

    // Read and execute classification tables migration
    console.log('\n4. Running classification tables migration...');
    const classificationTablesSql = await fs.readFile(
      join(__dirname, 'supabase/migrations/20240403000000_add_classification_tables.sql'),
      'utf8'
    );
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: classificationTablesSql
      });

      if (error) {
        console.error('❌ Classification tables migration error:', error.message);
        return;
      }
      console.log('✅ Classification tables migration completed');
    } catch (error) {
      console.error('❌ Classification tables migration error:', error.message);
      return;
    }

    // Read and execute reclassify function migration
    console.log('\n5. Running reclassify function migration...');
    const reclassifyFunctionSql = await fs.readFile(
      join(__dirname, 'supabase/migrations/20240404000000_add_reclassify_function.sql'),
      'utf8'
    );
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: reclassifyFunctionSql
      });

      if (error) {
        console.error('❌ Reclassify function migration error:', error.message);
        return;
      }
      console.log('✅ Reclassify function migration completed');
    } catch (error) {
      console.error('❌ Reclassify function migration error:', error.message);
      return;
    }

    // Read and execute audit logs migration
    console.log('\n6. Running audit logs migration...');
    const auditLogsSql = await fs.readFile(
      join(__dirname, 'supabase/migrations/20240405000000_add_audit_logs.sql'),
      'utf8'
    );
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: auditLogsSql
      });

      if (error) {
        console.error('❌ Audit logs migration error:', error.message);
        return;
      }
      console.log('✅ Audit logs migration completed');
    } catch (error) {
      console.error('❌ Audit logs migration error:', error.message);
      return;
    }

    // Read and execute dashboard tables migration
    console.log('\n7. Running dashboard tables migration...');
    const dashboardTablesSql = await fs.readFile(
      join(__dirname, 'supabase/migrations/20240405_dashboard_tables.sql'),
      'utf8'
    );
    
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: dashboardTablesSql
      });

      if (error) {
        console.error('❌ Dashboard tables migration error:', error.message);
        return;
      }
      console.log('✅ Dashboard tables migration completed');
    } catch (error) {
      console.error('❌ Dashboard tables migration error:', error.message);
      return;
    }

    console.log('\n✨ All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

runMigrations(); 