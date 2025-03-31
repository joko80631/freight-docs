import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { LoadService } from '../services/loadService.js';
import supabase from '../config/supabase';
import validateLoadCreation from '../middleware/validateLoad';

const router = express.Router();

// Validation schemas
const createLoadSchema = z.object({
  load_number: z.string().min(1, "Load number is required"),
  carrier_name: z.string().min(1, "Carrier name is required"),
  mc_number: z.string().optional(),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
  truck_number: z.string().optional(),
  trailer_number: z.string().optional(),
  delivery_date: z.string().datetime("Invalid delivery date")
});

// Helper function to validate load exists
async function validateLoad(loadId) {
    const { data, error } = await supabase
        .from('loads')
        .select('id')
        .eq('id', loadId)
        .single();

    if (error || !data) {
        throw new Error('Load not found');
    }
    return data;
}

// Routes
router.post('/', requireAuth, validateLoadCreation, async (req, res, next) => {
  try {
    const { 
      load_number, 
      carrier_name, 
      mc_number,
      driver_name,
      driver_phone,
      truck_number,
      trailer_number,
      delivery_date, 
      broker_id 
    } = req.body;

    // Check for duplicate load number
    const { data: existingLoad, error: checkError } = await supabase
        .from('loads')
        .select('id')
        .eq('load_number', load_number)
        .single();

    if (existingLoad) {
        return res.status(409).json({
            error: 'Load number already exists'
        });
    }

    const { data, error } = await supabase
        .from('loads')
        .insert([
            {
                load_number,
                carrier_name,
                mc_number,
                driver_name,
                driver_phone,
                truck_number,
                trailer_number,
                delivery_date,
                broker_id
            }
        ])
        .select()
        .single();

    if (error) throw error;

    res.status(201).json({
        message: 'Load created successfully',
        load: data
    });
  } catch (error) {
    console.error('Error creating load:', error);
    res.status(500).json({ 
        error: 'Error creating load',
        details: error.message 
    });
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const loads = await LoadService.getAllLoads(req.user.id);
    res.json(loads);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const load = await LoadService.getLoadById(req.user.id, req.params.id);
    res.json(load);
  } catch (error) {
    next(error);
  }
});

// Get load status and missing documents
router.get('/:id/status', async (req, res) => {
    try {
        const loadId = req.params.id;
        
        // Validate load exists
        await validateLoad(loadId);

        // Get all documents for this load
        const { data: documents, error: docsError } = await supabase
            .from('documents')
            .select('classification_type, confidence')
            .eq('load_id', loadId);

        if (docsError) throw docsError;

        // Define required document types
        const requiredDocs = ['POD', 'BOL', 'Invoice'];
        
        // Track which documents we have
        const foundDocs = new Set(documents.map(doc => doc.classification_type));
        
        // Calculate missing documents
        const missingDocs = requiredDocs.filter(doc => !foundDocs.has(doc));

        // Calculate completeness percentage
        const completeness = (foundDocs.size / requiredDocs.length) * 100;

        res.json({
            load_id: loadId,
            completeness_percentage: completeness,
            missing_documents: missingDocs,
            documents: documents
        });
    } catch (error) {
        console.error('Error getting load status:', error);
        res.status(500).json({ 
            error: 'Error getting load status',
            details: error.message 
        });
    }
});

export default router; 