/**
 * Utility functions for testing OpenAI connections and operations
 * @module openai-test-utils
 */

import OpenAI from 'openai';

/**
 * Tests the OpenAI connection by attempting to classify a test document
 * @async
 * @function testOpenAIConnection
 * @returns {Promise<boolean>} True if connection is successful, false otherwise
 * @throws {Error} If environment variables are not properly configured
 */
export async function testOpenAIConnection() {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
        throw new Error('OpenAI API key is not properly configured');
    }

    try {
        const openai = new OpenAI({
            apiKey: openaiApiKey
        });

        // Test document classification
        const testDocument = "This is a test invoice for $100.00";
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a document classifier. Classify the following document as either 'invoice', 'bill_of_lading', or 'other'."
                },
                {
                    role: "user",
                    content: testDocument
                }
            ],
            temperature: 0.3,
            max_tokens: 10
        });

        console.log('✅ OpenAI connection successful!');
        console.log('Classification:', response.choices[0].message.content);
        return true;
    } catch (error) {
        console.error('❌ OpenAI connection failed:', error.message);
        return false;
    }
}

/**
 * Tests OpenAI's document classification accuracy with a set of test documents
 * @async
 * @function testDocumentClassification
 * @param {Array<string>} testDocuments - Array of test documents to classify
 * @returns {Promise<Object>} Results of the classification test
 */
export async function testDocumentClassification(testDocuments = []) {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
        throw new Error('OpenAI API key is not properly configured');
    }

    try {
        const openai = new OpenAI({
            apiKey: openaiApiKey
        });

        const results = [];
        for (const doc of testDocuments) {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a document classifier. Classify the following document as either 'invoice', 'bill_of_lading', or 'other'."
                    },
                    {
                        role: "user",
                        content: doc
                    }
                ],
                temperature: 0.3,
                max_tokens: 10
            });

            results.push({
                document: doc,
                classification: response.choices[0].message.content
            });
        }

        console.log('✅ Document classification test completed!');
        return results;
    } catch (error) {
        console.error('❌ Document classification test failed:', error.message);
        throw error;
    }
} 