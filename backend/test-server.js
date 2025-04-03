import express from 'express';
import cors from 'cors';
import supabase from './supabase/index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 8080;

// CORS configuration
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Supabase test endpoint
app.get('/test-supabase', async (req, res) => {
  try {
    console.log('Testing Supabase connection via API...');
    
    const { data, error } = await supabase
      .from('loads')
      .select('id, load_number, carrier_name')
      .limit(1);

    if (error) {
      console.error('[Supabase Test Error]', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Supabase connection successful',
      sample: data,
    });
  } catch (err) {
    console.error('[Unexpected Error]', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Unexpected server error' 
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Test server is running on port ${port}`);
  console.log(`Health check endpoint: http://localhost:${port}/health`);
  console.log(`Supabase test endpoint: http://localhost:${port}/test-supabase`);
}); 