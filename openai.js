const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function classifyDocument(text) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a document classifier. Classify the following document as one of: POD (Proof of Delivery), BOL (Bill of Lading), Invoice, or Other. Return your response in JSON format with 'type' and 'confidence' fields."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return {
            type: result.type,
            confidence: result.confidence,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error classifying document:', error);
        throw error;
    }
}

module.exports = { classifyDocument }; 