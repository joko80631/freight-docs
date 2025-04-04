import { Document } from '@/types/document';
import { getConfidenceVariant, getConfidenceLabel } from './classification';

export { getConfidenceVariant, getConfidenceLabel };

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
    storage_path: `/documents/${id}.pdf`,
    type: 'invoice',
    confidence_score: 0.85,
    team_id: 'team_123',
    uploaded_by: 'user_123',
    uploaded_at: timestamp,
    ...overrides
  };
} 