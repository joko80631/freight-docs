import { Document } from '@/types/document';

/**
 * Badge variant types
 */
export type VariantType = 'success' | 'warning' | 'error' | 'info';

/**
 * Get the appropriate badge variant based on confidence level
 */
export function getConfidenceVariant(confidence: number): VariantType {
  if (confidence >= 0.9) return 'success';
  if (confidence >= 0.7) return 'warning';
  return 'error';
}

/**
 * Format confidence as a percentage string
 */
export function getConfidenceLabel(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get the appropriate badge variant based on document status
 */
export function getStatusVariant(status: string): VariantType {
  switch (status) {
    case 'processed':
      return 'success';
    case 'processing':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'info';
  }
}

/**
 * Calculate pagination indices
 */
export function getPaginationIndices(currentPage: number, pageSize: number, totalItems: number) {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);
  return { startIndex, endIndex };
}

/**
 * Create a mock document for testing
 */
export function createMockDocument(overrides: Partial<Document> = {}): Document {
  const id = Math.random().toString(36).substring(2, 9);
  const timestamp = new Date().toISOString();
  
  return {
    id,
    name: `Document ${id}`,
    type: 'Invoice',
    confidence: 0.85,
    status: 'processed',
    loadId: `LOAD-${id.substring(0, 3)}`,
    uploadedAt: timestamp,
    ...overrides
  };
} 