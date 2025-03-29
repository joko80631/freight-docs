/**
 * Global error handling middleware
 * Handles different types of errors and returns appropriate responses
 */

export const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    requestId: req.id
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      requestId: req.id
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
      requestId: req.id
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied',
      requestId: req.id
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message || 'Resource not found',
      requestId: req.id
    });
  }

  // Handle Supabase errors
  if (err.code?.startsWith('PGRST')) {
    return res.status(400).json({
      error: 'Database Error',
      message: err.message,
      requestId: req.id
    });
  }

  // Handle file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      message: err.message,
      requestId: req.id
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    requestId: req.id
  });
}; 