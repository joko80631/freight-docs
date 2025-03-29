import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticateUser } from '../middleware/auth.js';
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
  loadId: z.string().uuid("Invalid load ID").optional()
});

// Routes
router.post('/upload', authenticateUser, upload.single('file'), validateFile, async (req, res, next) => {
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

router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const document = await DocumentService.getDocumentById(req.user.id, req.params.id);
    res.json(document);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/download', authenticateUser, async (req, res, next) => {
  try {
    const document = await DocumentService.getDocumentById(req.user.id, req.params.id);
    const signedUrl = await DocumentService.generateSignedUrl(document.file_url);
    res.json({ url: signedUrl });
  } catch (error) {
    next(error);
  }
});

export default router; 