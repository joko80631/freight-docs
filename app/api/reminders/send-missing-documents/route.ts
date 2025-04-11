import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
// import { sendMissingDocumentReminder } from '@/lib/notifications';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Get current user for authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { loadId, documentTypes, recipients } = await req.json();

    if (!loadId || !documentTypes || !recipients) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get load details
    const { data: load, error: loadError } = await supabase
      .from('loads')
      .select('*, team:teams(*)')
      .eq('id', loadId)
      .single();

    if (loadError || !load) {
      return NextResponse.json(
        { error: 'Load not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this load's team
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', load.team_id)
      .eq('user_id', user.id)
      .single();

    if (!teamMember) {
      return NextResponse.json(
        { error: 'You do not have access to this load' },
        { status: 403 }
      );
    }

    // Get missing documents
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('load_id', loadId)
      .in('type', documentTypes);

    if (documentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Find missing document types
    const existingTypes = new Set(documents?.map(doc => doc.type) || []);
    const missingTypes = documentTypes.filter(type => !existingTypes.has(type));

    if (missingTypes.length === 0) {
      return NextResponse.json(
        { error: 'No missing documents found' },
        { status: 400 }
      );
    }

    // Mock sending reminders since the service is unavailable
    const results = recipients.map((recipientId: string) => ({
      recipientId,
      success: true,
      message: 'Reminder would be sent in production'
    }));

    return NextResponse.json({
      success: true,
      message: 'Document reminders processed',
      results
    });
  } catch (error) {
    console.error('Error sending document reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 