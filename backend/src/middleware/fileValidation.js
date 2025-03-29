import { z } from 'zod';

// Only allow PDFs and common image formats
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

// File validation schema
const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine(
    (type) => allowedTypes.includes(type),
    'Invalid file type. Only PDF and image files are allowed.'
  ),
  size: z.number().max(
    10 * 1024 * 1024, // 10MB
    'File size exceeds 10MB limit'
  ),
  buffer: z.instanceof(Buffer)
});

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
        error: 'Bad Request',
        message: 'No file uploaded'
      });
    }

    // Validate file against schema
    fileSchema.parse(req.file);

    // TODO: Implement virus scanning
    // This is a placeholder for future virus scanning integration
    console.log('File validation passed, virus scanning would occur here');

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.errors[0].message
      });
    }
    next(error);
  }
}; 