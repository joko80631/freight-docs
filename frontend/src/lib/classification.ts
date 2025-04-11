/**
 * Document types that can be classified
 */
export type DocumentType = 'BOL' | 'POD' | 'INVOICE' | 'OTHER';

/**
 * Result of document classification
 */
export interface ClassificationResult {
  type: DocumentType;
  confidence: number;
  reason: string;
}

/**
 * Classification history entry
 */
export interface ClassificationHistory {
  timestamp: string;
  type: DocumentType;
  confidence: number;
  reason: string;
}

/**
 * Determines the confidence variant based on a confidence percentage value
 * @param value - Confidence percentage (0-100)
 * @returns 'success' | 'warning' | 'destructive'
 */
export function getConfidenceVariant(value: number): 'success' | 'warning' | 'destructive' {
  if (value >= 85) return 'success';
  if (value >= 60) return 'warning';
  return 'destructive';
}

/**
 * Gets the confidence level label based on a confidence percentage value
 * @param value - Confidence percentage (0-100)
 * @returns 'High' | 'Medium' | 'Low'
 */
export function getConfidenceLabel(value: number): 'High' | 'Medium' | 'Low' {
  if (value >= 85) return 'High';
  if (value >= 60) return 'Medium';
  return 'Low';
}

/**
 * Classifies a document using OpenAI
 * @param file - The file to classify
 * @returns Promise<ClassificationResult>
 */
export async function classifyDocument(file: File): Promise<ClassificationResult> {
  try {
    // TODO: Replace with actual OpenAI API call
    // This is a placeholder implementation
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }),
    });

    if (!response.ok) {
      throw new Error('Classification failed');
    }

    const result = await response.json();
    return {
      type: result.type,
      confidence: result.confidence,
      reason: result.reason,
    };
  } catch (error) {
    console.error('Classification error:', error);
    throw error;
  }
} 