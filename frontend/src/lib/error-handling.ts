export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Handle Supabase errors
    if ('message' in error) {
      return error.message as string;
    }
    
    // Handle API responses with error property
    if ('error' in error) {
      return error.error as string;
    }
  }
  
  return 'An unknown error occurred';
}

export function parseOpenAiResponse(response: any): {
  type: 'bol' | 'pod' | 'invoice' | 'other';
  confidence: number;
  reason: string;
} {
  try {
    if (response.choices[0].message.function_call) {
      const functionCall = response.choices[0].message.function_call;
      const args = JSON.parse(functionCall.arguments);
      
      return {
        type: args.type || 'other',
        confidence: args.confidence || 0.5,
        reason: args.reason || 'No reason provided'
      };
    }
    
    // Fallback text parsing
    const content = response.choices[0].message.content || '';
    const typeMatch = content.match(/type:?\s*([a-z]+)/i);
    const confidenceMatch = content.match(/confidence:?\s*(0\.\d+)/i);
    const reasonMatch = content.match(/reason:?\s*(.+)$/m);
    
    return {
      type: (typeMatch?.[1].toLowerCase() as 'bol' | 'pod' | 'invoice' | 'other') || 'other',
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
      reason: reasonMatch?.[1].trim() || 'No reason extracted from text response'
    };
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    return {
      type: 'other',
      confidence: 0.5,
      reason: 'Failed to parse OpenAI response'
    };
  }
} 