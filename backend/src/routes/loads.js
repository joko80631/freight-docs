import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { LoadService } from '../services/loadService.js';

const router = express.Router();

// Validation schemas
const createLoadSchema = z.object({
  load_number: z.string().min(1, "Load number is required"),
  carrier_name: z.string().min(1, "Carrier name is required"),
  delivery_date: z.string().datetime("Invalid delivery date")
});

// Routes
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const validatedData = createLoadSchema.parse(req.body);
    const load = await LoadService.createLoad(req.user.id, validatedData);
    res.status(201).json(load);
  } catch (error) {
    next(error);
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

export default router; 