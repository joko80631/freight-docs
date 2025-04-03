import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user's current team
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', session.user.id)
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { error: 'No active team found' },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, PNG, and JPEG files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 20MB limit' },
        { status: 400 }
      );
    }

    // Generate a unique document ID
    const documentId = uuidv4();
    
    // Construct the storage path
    const storagePath = `${teamMember.team_id}/${documentId}/${file.name}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 60 * 15); // 15-minute expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Signed URL generation failed:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate file access URL' },
        { status: 500 }
      );
    }

    const signedUrl = signedUrlData.signedUrl;

    // Create document record in the database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        team_id: teamMember.team_id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
        uploaded_by: session.user.id,
        uploaded_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, attempt to clean up the uploaded file
      await supabase.storage
        .from('documents')
        .remove([storagePath]);
        
      console.error('Database insert error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      );
    }

    // Log storage path for debugging
    console.log('[Upload] Storage path:', storagePath);

    return NextResponse.json({
      document_id: documentId,
      storage_path: storagePath,
      signed_url: signedUrl,
      metadata: {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        uploaded_at: document.uploaded_at
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 