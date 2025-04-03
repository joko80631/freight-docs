import fetch from 'node-fetch';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    const response = await fetch('http://localhost:3002/api/test-supabase');
    const data = await response.json();
    
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Supabase connection test successful!');
    } else {
      console.error('❌ Supabase connection test failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error.message);
  }
}

testSupabaseConnection(); 