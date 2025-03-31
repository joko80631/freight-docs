const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSupabaseConnection() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Try to fetch a simple query
        const { data, error } = await supabase
            .from('documents')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('Supabase connection error:', error.message);
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

testSupabaseConnection(); 