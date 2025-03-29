import { z } from 'zod';

// Normalized MIME types and their friendly names
const ALLOWED_MIME_TYPES = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG'
};

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate file upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateFile = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please select a file to upload'
      });
    }

    // Validate file size
    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        error: 'File too large',
        message: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES[req.file.mimetype]) {
      const allowedTypes = Object.values(ALLOWED_MIME_TYPES).join(', ');
      return res.status(400).json({
        error: 'Invalid file type',
        message: `Only ${allowedTypes} files are allowed`
      });
    }

    // Validate filename
    const filenameSchema = z.string()
      .min(1, 'Filename is required')
      .max(255, 'Filename too long')
      .regex(/^[a-zA-Z0-9-_. ]+$/, 'Invalid filename characters');

    const result = filenameSchema.safeParse(req.file.originalname);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid filename',
        message: 'Please use a simple filename without special characters'
      });
    }

    // Normalize filename
    req.file.originalname = req.file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9-_. ]/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // TODO: Implement virus scanning
    // This is a placeholder for future virus scanning integration
    console.log('File validation passed, virus scanning would occur here');

    next();
  } catch (error) {
    next(error);
  }
}; 