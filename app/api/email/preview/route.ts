import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSampleData } from '@/lib/email/templates/samples';
import { renderTemplate, TemplateName } from '@/lib/email/templates';
import { NextRequest } from 'next/server';

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

    // Get sample data for the template
    const sampleData = await getSampleData(templateName, searchParams);
    if (!sampleData) {
      return NextResponse.json(
        { error: 'Invalid template name' },
        { status: 400 }
      );
    }

    // Render the template
    const { subject, html } = await renderTemplate(templateName, sampleData);

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