import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireTeamMember, requireTeamResourceAccess } from '../middleware/teamAuth.js';
import { validateFile } from '../middleware/fileValidation.js';
import { DocumentService } from '../services/documentService.js';
import { LoadService } from '../services/loadService.js';
import { createClient } from '@supabase/supabase-js';
import { validateDocumentStatus } from '../middleware/validateDocument.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

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
  teamId: z.string().uuid("Invalid team ID"),
  dueDate: z.string().datetime("Invalid due date").optional(),
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_CLARIFICATION', 'EXPIRED']).default('PENDING_REVIEW')
});

const updateSchema = z.object({
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_CLARIFICATION', 'EXPIRED']).optional(),
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

// Update document status
router.post('/:id/status', authenticateUser, validateDocumentStatus, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, updated_by } = req.body;

    // Start a transaction
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError) throw docError;

    // Update document status
    const { error: updateError } = await supabase
      .from('documents')
      .update({ status })
      .eq('id', id);

    if (updateError) throw updateError;

    // Create status history entry
    const { error: historyError } = await supabase
      .from('document_status_history')
      .insert({
        document_id: id,
        status,
        comment,
        updated_by,
        previous_status: document.status
      });

    if (historyError) throw historyError;

    // Fetch updated document
    const { data: updatedDoc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    res.json(updatedDoc);
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({ error: 'Failed to update document status' });
  }
});

// Update document due date
router.post('/:id/due-date', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { due_date } = req.body;

    if (!due_date) {
      return res.status(400).json({ error: 'Due date is required' });
    }

    const { data, error } = await supabase
      .from('documents')
      .update({ due_date })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating document due date:', error);
    res.status(500).json({ error: 'Failed to update document due date' });
  }
});

// Get document status history
router.get('/:id/status-history', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('document_status_history')
      .select(`
        *,
        updated_by:profiles(name)
      `)
      .eq('document_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching document status history:', error);
    res.status(500).json({ error: 'Failed to fetch document status history' });
  }
});

// Get all documents for a team
router.get('/teams/:teamId', requireAuth, requireTeamMember, async (req, res, next) => {
  try {
    const documents = await DocumentService.getTeamDocuments(req.params.teamId);
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// Get a specific document
router.get('/teams/:teamId/documents/:docId', requireAuth, requireTeamMember, async (req, res, next) => {
  try {
    const document = await DocumentService.getDocumentById(req.params.teamId, req.params.docId);
    res.json(document);
  } catch (error) {
    next(error);
  }
});

// Upload a document
router.post('/teams/:teamId/upload', requireAuth, requireTeamMember, upload.single('file'), validateFile, async (req, res, next) => {
  try {
    const validatedData = uploadSchema.parse({
      ...req.body,
      teamId: req.params.teamId
    });
    
    // Verify load ownership if loadId is provided
    if (validatedData.loadId) {
      const hasAccess = await LoadService.verifyLoadAccess(req.user.id, req.params.teamId, validatedData.loadId);
      if (!hasAccess) {
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

// Update document status
router.patch('/teams/:teamId/documents/:docId', requireAuth, requireTeamMember, validateDocumentStatus, async (req, res, next) => {
  try {
    const validatedData = updateSchema.parse(req.body);
    const document = await DocumentService.updateDocument(
      req.params.teamId,
      req.params.docId,
      validatedData
    );
    res.json(document);
  } catch (error) {
    next(error);
  }
});

// Delete a document
router.delete('/teams/:teamId/documents/:docId', requireAuth, requireTeamMember, async (req, res, next) => {
  try {
    await DocumentService.deleteDocument(req.params.teamId, req.params.docId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get signed URL for document
router.get('/teams/:teamId/documents/:docId/url', requireAuth, requireTeamMember, async (req, res, next) => {
  try {
    const document = await DocumentService.getDocumentById(req.params.teamId, req.params.docId);
    const signedUrl = await DocumentService.generateSignedUrl(document.file_url);
    res.json({ url: signedUrl });
  } catch (error) {
    next(error);
  }
});

export default router; 