import { supabase } from '../index.js';
import { classifyDocument } from './openaiService.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

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

export const DocumentService = {
  /**
   * Upload a document and create a record
   * @param {Object} user - The authenticated user
   * @param {Object} file - The uploaded file
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} The created document
   */
  uploadAndClassifyDocument: async (user, file, metadata) => {
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
        filePath = `${user.id}/${metadata.loadId || 'unassigned'}/${documentId}.${fileExt}`;

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
      const documentType = await classifyDocument(file.originalname);

      // Create document record
      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert([{
          id: documentId,
          user_id: user.id,
          load_id: metadata.loadId,
          file_url: publicUrl,
          file_path: filePath,
          file_hash: fileHash,
          original_filename: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size,
          type: documentType,
          status: 'pending'
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
  },

  /**
   * Get a document by ID
   * @param {string} userId - The ID of the user
   * @param {string} docId - The ID of the document
   * @returns {Promise<Object>} The document
   */
  getDocumentById: async (userId, docId) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .eq('user_id', userId)
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
  },

  /**
   * Generate a signed URL for a document
   * @param {string} fileUrl - The public URL of the file
   * @returns {Promise<string>} The signed URL
   */
  generateSignedUrl: async (fileUrl) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(fileUrl, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  },

  /**
   * Delete a document and its file
   * @param {string} userId - The ID of the user
   * @param {string} docId - The ID of the document
   * @returns {Promise<void>}
   */
  deleteDocument: async (userId, docId) => {
    // Get document to verify ownership and get file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path, file_hash')
      .eq('id', docId)
      .eq('user_id', userId)
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
        .eq('user_id', userId)
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
  },

  /**
   * Verify document ownership
   * @param {string} userId - The ID of the user
   * @param {string} docId - The ID of the document
   * @returns {Promise<boolean>} Whether the user owns the document
   */
  verifyDocumentOwnership: async (userId, docId) => {
    const { data, error } = await supabase
      .from('documents')
      .select('id')
      .eq('id', docId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return !!data;
  },

  /**
   * Get all documents for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of documents
   */
  getAllDocuments: async (userId) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}; 