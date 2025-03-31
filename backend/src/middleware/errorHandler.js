/**
 * Global error handling middleware
 * Handles different types of errors and returns appropriate responses
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File upload error',
      details: err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }

  // Handle Supabase errors
  if (err.code && err.code.startsWith('SUPABASE_')) {
    return res.status(500).json({
      error: 'Database error',
      details: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler; 