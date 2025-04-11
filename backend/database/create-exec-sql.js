import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function createExecSql() {
  console.log('Creating exec_sql function...\n');

  const sql = `
    -- Create the exec_sql function
    CREATE OR REPLACE FUNCTION public.exec_sql(query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
    END;
    $$;

    -- Grant execute permission to authenticated users
    GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;
  `;

  try {
    // Extract project reference from Supabase URL
    const projectRef = process.env.SUPABASE_URL.split('.')[0].split('//')[1];
    
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create exec_sql function: ${error}`);
    }

    console.log('✅ Exec SQL function created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createExecSql(); 