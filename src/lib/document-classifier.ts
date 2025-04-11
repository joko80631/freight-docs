import OpenAI from 'openai';
import { DocumentType } from '@/types/document';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ClassificationResult {
  type: DocumentType;
  confidence: number;
  reason?: string;
}

export const documentTypeSchema = {
  type: 'string',
  enum: ['BOL', 'POD', 'INVOICE', 'OTHER'],
} as const;

export async function classifyDocument(text: string): Promise<ClassificationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a freight document classifier. Examine the document and classify it accurately. Provide a detailed rationale for your classification decision formatted in Markdown. Use bullet points to highlight key evidence that informed your decision.'
        },
        {
          role: 'user',
          content: `Classify this freight document:\n\n${text}`
        }
      ],
      functions: [
        {
          name: 'classifyDocument',
          description: 'Classify the freight document into one of the predefined categories',
          parameters: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['BOL', 'POD', 'INVOICE', 'OTHER'],
                description: 'The document type classification'
              },
              confidence: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                description: 'Confidence score between 0 and 1'
              },
              reason: {
                type: 'string',
                description: 'Detailed explanation for the classification decision'
              }
            },
            required: ['type', 'confidence', 'reason']
          }
        }
      ],
      function_call: { name: 'classifyDocument' }
    });

    // Parse classification result
    let classification: ClassificationResult;
    try {
      const functionCall = response.choices[0].message.function_call;
      if (!functionCall) {
        throw new Error('No function call returned from OpenAI');
      }
      classification = JSON.parse(functionCall.arguments);
    } catch (error) {
      // Fallback: Parse from text response
      const typeMatch = text.match(/type:\s*([A-Za-z_]+)/i);
      classification = {
        type: typeMatch ? typeMatch[1].toUpperCase() as DocumentType : 'OTHER',
        confidence: 0.9,
        reason: 'Classified based on document content'
      };
    }

    return classification;
  } catch (error) {
    throw new Error(`Failed to classify document: ${error instanceof Error ? error.message : String(error)}`);
  }
} 