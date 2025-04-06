/**
 * Sample data for email template previews
 * This file contains realistic test data for each email template type
 */

import { TemplateData, TemplateName } from './index';

type SampleDataGenerator = (params: URLSearchParams) => Promise<TemplateData>;

const sampleGenerators: Record<string, SampleDataGenerator> = {
  'document-upload': async (params) => ({
    documentType: params.get('documentType') || 'Bill of Lading',
    uploadedBy: params.get('uploadedBy') || 'John Smith',
    documentUrl: params.get('documentUrl') || `${process.env.NEXT_PUBLIC_APP_URL}/documents/sample`,
    loadNumber: params.get('loadNumber') || 'L123456',
    dueDate: params.get('dueDate') || '2024-03-15',
    userId: params.get('userId') || 'user123',
    unsubscribeUrl: params.get('unsubscribeUrl') || `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=sample`,
  }),

  'missing-document': async (params) => ({
    documentType: params.get('documentType') || 'Proof of Delivery',
    dueDate: params.get('dueDate') || '2024-03-20',
    loadNumber: params.get('loadNumber') || 'L123456',
    recipientName: params.get('recipientName') || 'Jane Doe',
    uploadUrl: params.get('uploadUrl') || `${process.env.NEXT_PUBLIC_APP_URL}/loads/L123456/documents/upload`,
    userId: params.get('userId') || 'user123',
    unsubscribeUrl: params.get('unsubscribeUrl') || `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=sample`,
  }),

  'load-status': async (params) => ({
    loadNumber: params.get('loadNumber') || 'L123456',
    status: params.get('status') || 'In Transit',
    updatedBy: params.get('updatedBy') || 'John Smith',
    details: params.get('details') || 'Arrived at distribution center',
    loadUrl: params.get('loadUrl') || `${process.env.NEXT_PUBLIC_APP_URL}/loads/L123456`,
    recipientName: params.get('recipientName') || 'Jane Doe',
    userId: params.get('userId') || 'user123',
    unsubscribeUrl: params.get('unsubscribeUrl') || `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=sample`,
  }),

  'team-invite': async (params) => ({
    teamName: params.get('teamName') || 'Acme Logistics',
    inviterName: params.get('inviterName') || 'John Smith',
    inviteUrl: params.get('inviteUrl') || `${process.env.NEXT_PUBLIC_APP_URL}/teams/invite?token=sample`,
    role: params.get('role') || 'member',
    recipientName: params.get('recipientName') || 'Jane Doe',
    expiresIn: params.get('expiresIn') || '7 days',
    userId: params.get('userId') || 'user123',
    unsubscribeUrl: params.get('unsubscribeUrl') || `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=sample`,
  }),
};

export async function getSampleData(
  templateName: string,
  params: URLSearchParams
): Promise<TemplateData | null> {
  const generator = sampleGenerators[templateName];
  if (!generator) return null;
  
  return generator(params);
}

export const sampleData = {
  'team-invite': {
    inviterName: 'John Doe',
    teamName: 'Acme Corp',
    inviteUrl: 'https://example.com/invite/123',
    recipientName: 'Jane Smith',
    role: 'Member',
    expiresIn: '7 days',
  },
  'missing-document': {
    documentType: 'Bill of Lading',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    recipientName: 'Jane Smith',
    documentUrl: 'https://example.com/documents/123',
    loadId: 'LOAD-123',
    loadReference: 'REF-456',
    carrierName: 'Fast Shipping Inc',
  },
  'classification-result': {
    documentName: 'invoice.pdf',
    classification: 'Commercial Invoice',
    confidence: 0.95,
    recipientName: 'Jane Smith',
    documentUrl: 'https://example.com/documents/123',
    loadId: 'LOAD-123',
    loadReference: 'REF-456',
    extractedFields: {
      invoiceNumber: 'INV-789',
      date: new Date().toISOString(),
      amount: '$1,234.56',
      currency: 'USD',
    },
  },
  'document-uploaded': {
    documentName: 'bill_of_lading.pdf',
    documentType: 'Bill of Lading',
    recipientName: 'Jane Smith',
    documentUrl: 'https://example.com/documents/123',
    loadId: 'LOAD-123',
    loadReference: 'REF-456',
    uploadedBy: 'John Doe',
    uploadDate: new Date().toISOString(),
  },
  'load-status-update': {
    loadId: 'LOAD-123',
    loadReference: 'REF-456',
    status: 'In Transit',
    recipientName: 'Jane Smith',
    loadUrl: 'https://example.com/loads/123',
    previousStatus: 'Pending',
    updateDate: new Date().toISOString(),
    location: 'Los Angeles, CA',
    estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  'team-role-update': {
    teamName: 'Acme Corp',
    recipientName: 'Jane Smith',
    newRole: 'Admin',
    previousRole: 'Member',
    updatedBy: 'John Doe',
    updateDate: new Date().toISOString(),
    teamUrl: 'https://example.com/teams/123',
  },
} as const;

export type TemplateName = keyof typeof sampleData;

/**
 * Sample data for email templates
 * Used for testing and preview
 */
export const SAMPLE_DATA: Record<TemplateName, Record<string, any>> = {
  'document-upload': {
    documentName: 'Bill of Lading',
    documentType: 'BOL',
    uploadDate: new Date().toISOString(),
    status: 'pending',
    loadNumber: 'LOAD-123',
    carrierName: 'ABC Trucking',
    documentUrl: 'https://example.com/documents/bol-123',
  },
  'missing-document': {
    documentType: 'BOL',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    loadNumber: 'LOAD-123',
    carrierName: 'ABC Trucking',
    documentUrl: 'https://example.com/documents/upload/bol',
  },
  'load-status': {
    loadNumber: 'LOAD-123',
    status: 'in-transit',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    carrierName: 'ABC Trucking',
    currentLocation: 'Chicago, IL',
    trackingUrl: 'https://example.com/tracking/load-123',
  },
  'team-invite': {
    inviterName: 'John Doe',
    teamName: 'Freight Team',
    inviteLink: 'https://example.com/invite/123',
    role: 'Member',
    expiresIn: '7 days',
  },
};

/**
 * Get sample data for a template
 * @param templateName The name of the template
 * @param overrides Optional overrides for the sample data
 */
export function getSampleData(
  templateName: TemplateName,
  overrides: Record<string, any> = {}
): Record<string, any> {
  const baseData = SAMPLE_DATA[templateName];
  if (!baseData) {
    throw new Error(`No sample data found for template: ${templateName}`);
  }

  return {
    ...baseData,
    ...overrides,
  };
}

/**
 * Get sample data for all templates
 * @param overrides Optional overrides for the sample data
 */
export function getAllSampleData(
  overrides: Partial<Record<TemplateName, Record<string, any>>> = {}
): Record<TemplateName, Record<string, any>> {
  return Object.entries(SAMPLE_DATA).reduce(
    (acc, [templateName, data]) => ({
      ...acc,
      [templateName as TemplateName]: {
        ...data,
        ...(overrides[templateName as TemplateName] || {}),
      },
    }),
    {} as Record<TemplateName, Record<string, any>>
  );
} 