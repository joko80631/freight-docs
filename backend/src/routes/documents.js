import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validateFile } from '../middleware/fileValidation.js';
import { DocumentService } from '../services/documentService.js';
import { LoadService } from '../services/loadService.js';

const router = express.Router();

// Multer configuration with file size limit
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Validation schemas
const uploadSchema = z.object({
  loadId: z.string().uuid("Invalid load ID").optional(),
  dueDate: z.string().datetime("Invalid due date").optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending')
});

const updateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  dueDate: z.string().datetime("Invalid due date").optional()
});

// Routes
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const documents = await DocumentService.getAllDocuments(req.user.id);
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

router.post('/upload', requireAuth, upload.single('file'), validateFile, async (req, res, next) => {
  try {
    const validatedData = uploadSchema.parse(req.body);
    
    // Verify load ownership if loadId is provided
    if (validatedData.loadId) {
      const isOwner = await LoadService.verifyLoadOwnership(req.user.id, validatedData.loadId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Access denied to this load' });
      }
    }

    const document = await DocumentService.uploadAndClassifyDocument(
      req.user,
      req.file,
      validatedData
    );
    
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const document = await DocumentService.getDocumentById(req.user.id, req.params.id);
    res.json(document);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/download', requireAuth, async (req, res, next) => {
  try {
    const document = await DocumentService.getDocumentById(req.user.id, req.params.id);
    const signedUrl = await DocumentService.generateSignedUrl(document.file_url);
    res.json({ url: signedUrl });
  } catch (error) {
    next(error);
  }
});

// Update document status and due date
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const validatedData = updateSchema.parse(req.body);
    
    // Verify document ownership
    const isOwner = await DocumentService.verifyDocumentOwnership(req.user.id, req.params.id);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied to this document' });
    }

    const document = await DocumentService.updateDocument(req.params.id, validatedData);
    res.json(document);
  } catch (error) {
    next(error);
  }
});

export default router; 