import { Document, DocumentStatus, DocumentType } from '@/types/database';

export interface LoadCompletion {
  count: number;
  total: number;
  isComplete: boolean;
  missingTypes: DocumentType[];
}

const REQUIRED_DOCUMENT_TYPES: DocumentType[] = ['POD', 'BOL', 'INVOICE'];

export function getLoadCompletion(documents: Document[]): LoadCompletion {
  const receivedTypes = new Set(
    documents
      .filter(d => d.status === 'classified')
      .map(d => d.type)
      .filter((type): type is DocumentType => type !== null && type !== undefined)
  );
  
  const missingTypes = REQUIRED_DOCUMENT_TYPES.filter(type => !receivedTypes.has(type));
  
  return {
    count: receivedTypes.size,
    total: REQUIRED_DOCUMENT_TYPES.length,
    isComplete: receivedTypes.size === REQUIRED_DOCUMENT_TYPES.length,
    missingTypes
  };
} 