import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSampleData } from '@/lib/email/templates/samples';
import { renderTemplate } from '@/lib/email/templates';

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

export async function POST(req: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'production') {
      // Get current user for authentication
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Parse request body
      const { templateName, data, format = 'html' } = await req.json();

      if (!templateName) {
        return NextResponse.json(
          { error: 'Template name is required' },
          { status: 400 }
        );
      }

      // Render the template with provided data
      const html = renderTemplate(templateName, data);

      // Return based on requested format
      if (format === 'json') {
        return NextResponse.json({
          template: templateName,
          data,
          html,
        });
      }

      // Return the rendered HTML
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Email preview only available in development' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Error previewing email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 