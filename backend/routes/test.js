import express from 'express';
import supabase from '../supabase/index.js';

const router = express.Router();

router.get('/test-supabase', async (req, res) => {
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

export default router; 