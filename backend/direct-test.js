import supabase from './supabase/index.js';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection directly...');
    
    const { data, error } = await supabase
      .from('loads')
      .select('id, load_number, carrier_name')
      .limit(1);

    if (error) {
      console.error('[Supabase Test Error]', error);
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connection test successful!');
      console.log('Sample data:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('[Unexpected Error]', err);
    console.error('❌ Error testing Supabase connection:', err.message);
  }
}

testSupabaseConnection(); 