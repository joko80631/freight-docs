const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure multer for file upload with size limits and strict MIME checks
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Sanitize filename to prevent path traversal
        const sanitizedFilename = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, Date.now() + '-' + sanitizedFilename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Strict MIME type checking
        const allowedTypes = ['application/pdf', 'text/plain'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only PDF and TXT files are allowed.'));
        }
        cb(null, true);
    }
});

module.exports = upload; 