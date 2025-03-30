const https = require('https');
require('dotenv').config();

const url = process.env.SUPABASE_URL;
console.log(`Testing connection to: ${url}`);

https.get(url, (res) => {
  console.log(`Connection successful! Status code: ${res.statusCode}`);
  process.exit(0);
}).on('error', (err) => {
  console.error(`Connection failed: ${err.message}`);
  process.exit(1);
}); 