import JSZip from 'jszip';
import { Document } from '@/types/document';
import { createError, ErrorCode } from './errors';
import { showToast } from './toast';

interface DownloadResult {
  success: boolean;
  skippedDocuments?: Document[];
  error?: string;
}

export async function batchDownload(documents: Document[]): Promise<DownloadResult> {
  try {
    const documentsWithUrls = documents.filter(doc => doc.fileUrl);
    const skippedDocuments = documents.filter(doc => !doc.fileUrl);

    if (documentsWithUrls.length === 0) {
      return {
        success: false,
        error: 'No documents with valid URLs found',
        skippedDocuments,
      };
    }

    // Create a zip file containing all documents
    const zip = new JSZip();
    
    for (const doc of documentsWithUrls) {
      try {
        const response = await fetch(doc.fileUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${doc.name}`);
        
        const blob = await response.blob();
        zip.file(doc.name, blob);
      } catch (error) {
        console.error(`Error downloading ${doc.name}:`, error);
        skippedDocuments.push(doc);
      }
    }

    // Generate and download the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'documents.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      skippedDocuments: skippedDocuments.length > 0 ? skippedDocuments : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to download documents';
    throw createError(message, 'FILE_ERROR' as ErrorCode, error);
  }
} 