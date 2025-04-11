import { NextResponse } from 'next/server';
import { DocumentType } from '@/lib/classification';

// TODO: Replace with actual OpenAI API call
// This is a mock implementation for development
async function mockClassifyDocument(fileName: string, fileType: string): Promise<{
  type: DocumentType;
  confidence: number;
  reason: string;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple mock logic based on file name
  const name = fileName.toLowerCase();
  let type: DocumentType = 'OTHER';
  let confidence = 0.6;
  let reason = '';

  if (name.includes('bol') || name.includes('bill of lading')) {
    type = 'BOL';
    confidence = 0.95;
    reason = 'File name contains BOL indicators';
  } else if (name.includes('pod') || name.includes('proof of delivery')) {
    type = 'POD';
    confidence = 0.9;
    reason = 'File name contains POD indicators';
  } else if (name.includes('invoice') || name.includes('inv')) {
    type = 'INVOICE';
    confidence = 0.85;
    reason = 'File name contains invoice indicators';
  } else {
    reason = 'No clear document type indicators found';
  }

  return { type, confidence, reason };
}

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await mockClassifyDocument(fileName, fileType);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Classification failed' },
      { status: 500 }
    );
  }
} 