import { Document } from '@/types/document';

export async function reclassifyDocument(id: string, payload: { type: string; reason: string }): Promise<Document> {
  const response = await fetch(`/api/documents/${id}/reclassify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to reclassify document');
  }

  return response.json();
}

export async function linkDocumentToLoad(documentId: string, loadId: string): Promise<Document> {
  const response = await fetch(`/api/documents/${documentId}/link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ loadId }),
  });

  if (!response.ok) {
    throw new Error('Failed to link document to load');
  }

  return response.json();
}

export async function unlinkDocument(documentId: string): Promise<Document> {
  const response = await fetch(`/api/documents/${documentId}/unlink`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to unlink document');
  }

  return response.json();
}

export async function deleteDocument(documentId: string): Promise<void> {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }
}

export async function fetchDocumentEvents(documentId: string): Promise<Document['events']> {
  const response = await fetch(`/api/documents/${documentId}/events`);

  if (!response.ok) {
    throw new Error('Failed to fetch document events');
  }

  return response.json();
}

export async function refreshDocumentUrl(documentId: string): Promise<{ url: string }> {
  const response = await fetch(`/api/documents/${documentId}/url`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to refresh document URL');
  }

  return response.json();
} 