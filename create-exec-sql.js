require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createExecSqlFunction() {
  try {
    const { data, error } = await supabase
      .from('_sql')
      .insert([{
        query: `
          CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;

          GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
          GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
        `
      }])
      .select();

    if (error) {
      console.error('Error creating exec_sql function:', error);
      process.exit(1);
    }

    console.log('Successfully created exec_sql function');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

createExecSqlFunction(); 