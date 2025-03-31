import { supabase } from '../config/supabase.js';
import { classifyDocument } from './openaiService.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { z } from 'zod';
import { TeamService } from './teamService.js';

// Feature flag for deduplication
const DEDUPLICATION_ENABLED = process.env.DEDUPLICATION_ENABLED === 'true';

/**
 * Calculate SHA-256 hash of a buffer
 * @param {Buffer} buffer - The file buffer to hash
 * @returns {string} The SHA-256 hash
 */
const calculateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

// Validation schemas
const uploadSchema = z.object({
  teamId: z.string().uuid("Invalid team ID"),
  loadId: z.string().uuid("Invalid load ID").optional(),
  dueDate: z.string().datetime("Invalid due date").optional(),
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_CLARIFICATION', 'EXPIRED']).default('PENDING_REVIEW')
});

const updateSchema = z.object({
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_CLARIFICATION', 'EXPIRED']).optional(),
  dueDate: z.string().datetime("Invalid due date").optional()
});

export class DocumentService {
  /**
   * Upload a document and create a record
   * @param {Object} user - The authenticated user
   * @param {Object} file - The uploaded file
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} The created document
   */
  static async uploadAndClassifyDocument(user, file, data) {
    const validatedData = uploadSchema.parse(data);

    // Verify team access
    const hasAccess = await TeamService.verifyTeamAccess(user.id, validatedData.teamId);
    if (!hasAccess) {
      throw new Error('Access denied: Not a team member');
    }

    // If loadId is provided, verify load access
    if (validatedData.loadId) {
      const hasLoadAccess = await TeamService.verifyTeamAccess(user.id, validatedData.teamId);
      if (!hasLoadAccess) {
        throw new Error('Access denied: Not a team member');
      }
    }

    let filePath = null;
    let existingDocument = null;

    try {
      // Generate unique document ID
      const documentId = uuidv4();
      
      // Calculate file hash if deduplication is enabled
      const fileHash = DEDUPLICATION_ENABLED ? calculateFileHash(file.buffer) : null;

      // Check for existing document with same hash if deduplication is enabled
      if (DEDUPLICATION_ENABLED && fileHash) {
        const { data: existing } = await supabase
          .from('documents')
          .select('file_path')
          .eq('file_hash', fileHash)
          .eq('team_id', validatedData.teamId)
          .eq('user_id', user.id)
          .single();

        if (existing) {
          existingDocument = existing;
          filePath = existing.file_path;
        }
      }

      // Only upload if no existing file found
      if (!existingDocument) {
        // Create a predictable file path structure
        const fileExt = file.originalname.split('.').pop().toLowerCase();
        filePath = `${validatedData.teamId}/${validatedData.loadId || 'unassigned'}/${documentId}.${fileExt}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Classify document type
      const documentType = await this.classifyDocument(file);

      // Create document record
      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert([{
          id: documentId,
          team_id: validatedData.teamId,
          load_id: validatedData.loadId,
          user_id: user.id,
          file_url: publicUrl,
          file_path: filePath,
          file_hash: fileHash,
          original_filename: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size,
          type: documentType,
          status: validatedData.status,
          due_date: validatedData.dueDate || null
        }])
        .select()
        .single();

      if (insertError) {
        // Cleanup: Delete uploaded file if DB insert fails and it's a new file
        if (!existingDocument) {
          await supabase.storage
            .from('documents')
            .remove([filePath]);
        }
        throw insertError;
      }

      return document;
    } catch (error) {
      // Ensure cleanup on any error
      if (filePath && !existingDocument) {
        await supabase.storage
          .from('documents')
          .remove([filePath]);
      }
      throw error;
    }
  }

  /**
   * Get a document by ID
   * @param {string} teamId - The ID of the team
   * @param {string} docId - The ID of the document
   * @returns {Promise<Object>} The document
   */
  static async getDocumentById(teamId, docId) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        load:loads (
          id,
          origin,
          destination
        )
      `)
      .eq('id', docId)
      .eq('team_id', teamId)
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error('Document not found');
    }

    // Verify file exists in storage
    const { data: fileExists } = await supabase.storage
      .from('documents')
      .list(data.file_path.split('/').slice(0, -1).join('/'));

    if (!fileExists?.some(f => f.name === data.file_path.split('/').pop())) {
      // Cleanup: Remove orphaned DB record if file doesn't exist
      await supabase
        .from('documents')
        .delete()
        .eq('id', docId);
      throw new Error('Document file not found');
    }

    return data;
  }

  /**
   * Generate a signed URL for a document
   * @param {string} fileUrl - The public URL of the file
   * @returns {Promise<string>} The signed URL
   */
  static async generateSignedUrl(fileUrl) {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(fileUrl, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  }

  /**
   * Delete a document and its file
   * @param {string} teamId - The ID of the team
   * @param {string} docId - The ID of the document
   * @returns {Promise<void>}
   */
  static async deleteDocument(teamId, docId) {
    // Get document to verify ownership and get file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path, file_hash')
      .eq('id', docId)
      .eq('team_id', teamId)
      .single();

    if (fetchError) throw fetchError;
    if (!document) {
      throw new Error('Document not found');
    }

    // Check if file is referenced by other documents
    if (DEDUPLICATION_ENABLED && document.file_hash) {
      const { count } = await supabase
        .from('documents')
        .select('id', { count: 'exact' })
        .eq('file_hash', document.file_hash)
        .eq('team_id', teamId)
        .neq('id', docId);

      // Only delete file if it's the last reference
      if (count === 0) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);

        if (storageError) throw storageError;
      }
    } else {
      // If deduplication is disabled, always delete the file
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;
    }

    // Delete document record
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId);

    if (deleteError) throw deleteError;
  }

  /**
   * Verify document ownership
   * @param {string} userId - The ID of the user
   * @param {string} teamId - The ID of the team
   * @param {string} docId - The ID of the document
   * @returns {Promise<boolean>} Whether the user owns the document
   */
  static async verifyDocumentAccess(userId, teamId, docId) {
    const { data: document } = await supabase
      .from('documents')
      .select('team_id')
      .eq('id', docId)
      .single();

    if (!document) return false;

    return await TeamService.verifyTeamAccess(userId, document.team_id);
  }

  /**
   * Get all documents for a team
   * @param {string} teamId - The ID of the team
   * @returns {Promise<Array>} Array of documents
   */
  static async getTeamDocuments(teamId) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        load:loads (
          id,
          origin,
          destination
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Update document status and due date
   * @param {string} teamId - The ID of the team
   * @param {string} docId - The ID of the document
   * @param {Object} data - The update data
   * @returns {Promise<Object>} The updated document
   */
  static async updateDocument(teamId, docId, data) {
    const validatedData = updateSchema.parse(data);

    const { data: document, error } = await supabase
      .from('documents')
      .update(validatedData)
      .eq('id', docId)
      .eq('team_id', teamId)
      .select()
      .single();

    if (error) throw error;
    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }

  static async classifyDocument(file) {
    // TODO: Implement document classification logic
    // For now, return a default type
    return 'OTHER';
  }
} 