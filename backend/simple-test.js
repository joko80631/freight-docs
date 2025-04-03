import http from 'http';
import supabase from './supabase/index.js';

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.url === '/test-supabase') {
    try {
      console.log('Testing Supabase connection...');
      
      const { data, error } = await supabase
        .from('loads')
        .select('id, load_number, carrier_name')
        .limit(1);

      if (error) {
        console.error('[Supabase Test Error]', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message 
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Supabase connection successful',
        sample: data,
      }));
    } catch (err) {
      console.error('[Unexpected Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: 'Unexpected server error' 
      }));
    }
    return;
  }

  res.writeHead(404);
  res.end();
});

const port = 8080;
server.listen(port, () => {
  console.log(`Simple test server is running on port ${port}`);
  console.log(`Health check endpoint: http://localhost:${port}/health`);
  console.log(`Supabase test endpoint: http://localhost:${port}/test-supabase`);
}); 