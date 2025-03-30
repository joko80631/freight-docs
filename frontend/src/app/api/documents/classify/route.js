import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Verify environment variables
    if (!process.env.BACKEND_URL || !process.env.BACKEND_API_KEY) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { documentPath, loadId } = await request.json();
    if (!documentPath || !loadId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify document ownership
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('uploaded_by')
      .eq('path', documentPath)
      .single();

    if (documentError || !document || document.uploaded_by !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to document' },
        { status: 403 }
      );
    }

    // Get the document from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(documentPath);

    if (fileError) {
      throw fileError;
    }

    // Send to backend for classification with retry logic
    let classificationResult;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/documents/classify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`
          },
          body: JSON.stringify({
            documentPath,
            loadId,
            fileType: fileData.type,
            fileSize: fileData.size
          })
        });

        if (!response.ok) {
          throw new Error(`Classification failed with status ${response.status}`);
        }

        classificationResult = await response.json();
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      }
    }

    // Update document record with classification
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        document_type: classificationResult.documentType,
        confidence: classificationResult.confidence,
        classification_status: 'completed'
      })
      .eq('path', documentPath)
      .eq('uploaded_by', user.id); // Add ownership check to update

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(classificationResult);
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Failed to classify document' },
      { status: 500 }
    );
  }
} 