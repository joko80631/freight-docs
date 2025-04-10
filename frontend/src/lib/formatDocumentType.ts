import { DocumentType } from '@/types/database';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  POD: 'Proof of Delivery',
  BOL: 'Bill of Lading',
  INVOICE: 'Invoice',
};

export function formatDocumentType(type: DocumentType): string {
  return DOCUMENT_TYPE_LABELS[type] || 'Unknown';
} 