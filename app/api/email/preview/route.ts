import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
// import { getSampleData } from '@/lib/email/templates/samples';
import { renderTemplate, TemplateName } from '@/lib/email/templates';
import { NextRequest } from 'next/server';

// Sample data map for each template type
const sampleDataMap = {
  'document-upload': {
    documentType: 'Bill of Lading',
    uploadedBy: 'John Doe',
    documentUrl: 'https://example.com/documents/bol-123',
    loadNumber: 'LOAD-123',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  'missing-document': {
    documentType: 'Bill of Lading',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    loadNumber: 'LOAD-123',
    uploadUrl: 'https://example.com/documents/upload/bol',
  },
  'load-status': {
    loadNumber: 'LOAD-123',
    status: 'In Transit',
    updatedBy: 'John Doe',
    details: 'Load is currently in transit to destination',
    loadUrl: 'https://example.com/loads/123',
  },
  'team-invite': {
    teamName: 'Acme Corp',
    inviterName: 'John Doe',
    inviteUrl: 'https://example.com/invite/123',
    role: 'Member',
    expiresIn: '7 days',
  },
};

export async function GET(req: Request) {
  try {
    // Check if preview is enabled
    if (process.env.NEXT_PUBLIC_ENABLE_EMAIL_PREVIEW !== 'true') {
      return NextResponse.json(
        { error: 'Email preview is disabled' },
        { status: 403 }
      );
    }

    // Get current user for authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const templateName = searchParams.get('template');
    if (!templateName) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    // Get the appropriate sample data for the template
    const templateKey = templateName as TemplateName;
    const sampleData = sampleDataMap[templateKey] || {};

    // Render the template
    const { subject, html } = await renderTemplate(templateKey, sampleData);

    return NextResponse.json({
      template: templateName,
      subject,
      html,
      data: sampleData,
    });
  } catch (error) {
    console.error('Error previewing email template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { templateName, testData } = await request.json();

    if (!templateName) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    // Render the template with test data
    const renderedTemplate = await renderTemplate(
      templateName as TemplateName,
      testData || {}
    );

    return NextResponse.json(renderedTemplate);
  } catch (error) {
    console.error('Error previewing email template:', error);
    return NextResponse.json(
      { error: 'Failed to preview email template' },
      { status: 500 }
    );
  }
} 