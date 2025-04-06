import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { renderEmailTemplate } from '@/lib/email/utils/template-renderer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { templateId, testData } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Fetch the template from the database
    const { data: template, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      return NextResponse.json(
        { error: 'Failed to fetch template' },
        { status: 500 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Generate test data if not provided
    const data = testData || generateTestData(template.category);

    // Render the template with the test data
    const renderedContent = await renderEmailTemplate(template.content, data);
    const renderedSubject = await renderEmailTemplate(template.subject, data);

    return NextResponse.json({
      subject: renderedSubject,
      content: renderedContent,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        version: template.version,
      },
      testData: data,
    });
  } catch (error) {
    console.error('Error previewing template:', error);
    return NextResponse.json(
      { error: 'Failed to preview template' },
      { status: 500 }
    );
  }
}

/**
 * Generate test data based on template category
 * @param category Template category
 * @returns Test data object
 */
function generateTestData(category: string): Record<string, any> {
  // Base test data for all templates
  const baseData = {
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      company: 'Acme Inc.',
    },
    app: {
      name: 'Freight Management',
      url: 'https://freight.example.com',
    },
    unsubscribeUrl: 'https://freight.example.com/unsubscribe?token=test-token',
  };

  // Category-specific test data
  const categoryData: Record<string, Record<string, any>> = {
    'team-invites': {
      inviter: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      },
      team: {
        name: 'Logistics Team',
        role: 'Member',
      },
      inviteUrl: 'https://freight.example.com/invite?token=test-invite-token',
    },
    'document-uploads': {
      document: {
        name: 'Invoice-2023-001.pdf',
        type: 'Invoice',
        size: '2.5 MB',
        uploadedAt: new Date().toISOString(),
      },
      uploader: {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
      },
    },
    'classification': {
      shipment: {
        id: 'SH-12345',
        status: 'Classified',
        classification: 'Hazardous Materials',
        details: 'Contains flammable liquids',
      },
      classifier: {
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
      },
    },
    'missing-documents': {
      shipment: {
        id: 'SH-67890',
        status: 'Pending Documents',
        missingDocuments: ['Bill of Lading', 'Customs Declaration'],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  };

  // Return combined test data
  return {
    ...baseData,
    ...(categoryData[category] || {}),
  };
} 