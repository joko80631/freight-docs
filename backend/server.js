const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const supabase = require('./supabase');
const { classifyDocument } = require('./openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://freight-docs-ten.vercel.app'
    ],
    credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV 
    });
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware for JSON parsing
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
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
        fileSize: 10 * 1024 * 1024, // 10MB limit
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

// Helper function to read file content based on type
async function readFileContent(filePath, fileType) {
    if (fileType === 'application/pdf') {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } else {
        return await fs.readFile(filePath, 'utf-8');
    }
}

// Helper function to validate load exists
async function validateLoad(loadId) {
    const { data, error } = await supabase
        .from('loads')
        .select('id')
        .eq('id', loadId)
        .single();

    if (error || !data) {
        throw new Error('Load not found');
    }
    return data;
}

// Middleware to validate load creation request
const validateLoadCreation = (req, res, next) => {
    const { load_number, carrier_name, delivery_date } = req.body;

    // Required fields
    if (!load_number || !carrier_name) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['load_number', 'carrier_name']
        });
    }

    // Validate load number format (alphanumeric with optional hyphens)
    if (!/^[A-Za-z0-9-]+$/.test(load_number)) {
        return res.status(400).json({
            error: 'Invalid load number format. Use only letters, numbers, and hyphens.'
        });
    }

    // Validate delivery date if provided
    if (delivery_date) {
        const date = new Date(delivery_date);
        if (isNaN(date.getTime())) {
            return res.status(400).json({
                error: 'Invalid delivery date format'
            });
        }
    }

    next();
};

// Create new load
app.post('/loads', validateLoadCreation, async (req, res) => {
    try {
        const { load_number, carrier_name, delivery_date, broker_id } = req.body;

        // Check for duplicate load number
        const { data: existingLoad, error: checkError } = await supabase
            .from('loads')
            .select('id')
            .eq('load_number', load_number)
            .single();

        if (existingLoad) {
            return res.status(409).json({
                error: 'Load number already exists'
            });
        }

        const { data, error } = await supabase
            .from('loads')
            .insert([
                {
                    load_number,
                    carrier_name,
                    delivery_date,
                    broker_id
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Load created successfully',
            load: data
        });
    } catch (error) {
        console.error('Error creating load:', error);
        res.status(500).json({ 
            error: 'Error creating load',
            details: error.message 
        });
    }
});

// Get load status and missing documents
app.get('/loads/:id/status', async (req, res) => {
    try {
        const loadId = req.params.id;
        
        // Validate load exists
        await validateLoad(loadId);

        // Get all documents for this load
        const { data: documents, error: docsError } = await supabase
            .from('documents')
            .select('classification_type, confidence')
            .eq('load_id', loadId);

        if (docsError) throw docsError;

        // Define required document types
        const requiredDocs = ['POD', 'BOL', 'Invoice'];
        
        // Track which documents we have
        const foundDocs = new Set(documents.map(doc => doc.classification_type));
        
        // Calculate missing documents
        const missingDocs = requiredDocs.filter(doc => !foundDocs.has(doc));

        // Calculate completeness percentage
        const completeness = (foundDocs.size / requiredDocs.length) * 100;

        res.json({
            load_id: loadId,
            completeness_percentage: completeness,
            missing_documents: missingDocs,
            documents: documents
        });
    } catch (error) {
        console.error('Error getting load status:', error);
        res.status(500).json({ 
            error: 'Error getting load status',
            details: error.message 
        });
    }
});

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate load_id if provided
        if (req.body.load_id) {
            await validateLoad(req.body.load_id);
        }

        // Read the uploaded file
        const fileContent = await readFileContent(req.file.path, req.file.mimetype);

        // Classify the document using OpenAI
        const classification = await classifyDocument(fileContent);

        // Check confidence threshold
        if (classification.confidence < 0.7) {
            throw new Error('Document classification confidence too low (minimum 0.7 required)');
        }

        // Upload to Supabase Storage
        const fileName = path.basename(req.file.path);
        const { data: storageData, error: storageError } = await supabase.storage
            .from('documents')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                metadata: classification
            });

        if (storageError) throw storageError;

        // Insert document record into Supabase
        const { data: documentData, error: dbError } = await supabase
            .from('documents')
            .insert([
                {
                    file_name: fileName,
                    file_type: req.file.mimetype,
                    storage_path: storageData.path,
                    classification_type: classification.type,
                    confidence: classification.confidence,
                    load_id: req.body.load_id || null,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (dbError) throw dbError;

        // Clean up the temporary file
        await fs.unlink(req.file.path);

        res.json({
            message: 'File processed successfully',
            document: documentData,
            classification
        });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ 
            error: 'Error processing file',
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 