import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ClassificationResult {
  type: 'bol' | 'pod' | 'invoice' | 'other';
  confidence: number;
  reason: string;
}

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
                enum: ['bol', 'pod', 'invoice', 'other'],
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
      const content = response.choices[0].message.content || '';
      const typeMatch = content.match(/type:?\s*([a-z]+)/i);
      const confidenceMatch = content.match(/confidence:?\s*(0\.\d+)/i);
      const reasonMatch = content.match(/reason:?\s*(.+)$/is);
      
      classification = {
        type: typeMatch ? typeMatch[1].toLowerCase() as ClassificationResult['type'] : 'other',
        confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
        reason: reasonMatch ? reasonMatch[1].trim() : 'Unable to extract detailed reasoning'
      };
    }

    return classification;
  } catch (error) {
    console.error('Error classifying document:', error);
    throw new Error('Failed to classify document');
  }
} 