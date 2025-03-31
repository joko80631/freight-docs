const { z } = require('zod');

const loadSchema = z.object({
    load_number: z.string().min(1, 'Load number is required'),
    carrier_name: z.string().min(1, 'Carrier name is required'),
    delivery_date: z.string().datetime('Invalid delivery date'),
    broker_id: z.string().uuid('Invalid broker ID')
});

const validateLoadCreation = (req, res, next) => {
    try {
        const validatedData = loadSchema.parse(req.body);
        req.body = validatedData;
        next();
    } catch (error) {
        res.status(400).json({
            error: 'Validation failed',
            details: error.errors
        });
    }
};

module.exports = validateLoadCreation; 