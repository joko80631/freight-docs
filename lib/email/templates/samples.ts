/**
 * Sample data for email template previews
 * This file contains realistic test data for each email template type
 */

export type TemplateData = Record<string, any>;

const sampleGenerators: Record<string, (params: URLSearchParams) => Promise<TemplateData>> = {
  'document-upload': async (params) => ({
    documentName: params.get('documentName') || 'Bill of Lading',
    documentType: params.get('documentType') || 'BOL',
    uploadDate: new Date().toISOString(),
    status: params.get('status') || 'pending',
    loadNumber: params.get('loadNumber') || 'LOAD-123',
    carrierName: params.get('carrierName') || 'ABC Trucking',
    documentUrl: params.get('documentUrl') || 'https://example.com/documents/bol-123',
  }),
  'missing-document': async (params) => ({
    documentType: params.get('documentType') || 'BOL',
    dueDate: params.get('dueDate') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    loadNumber: params.get('loadNumber') || 'LOAD-123',
    carrierName: params.get('carrierName') || 'ABC Trucking',
    documentUrl: params.get('documentUrl') || 'https://example.com/documents/upload/bol',
  }),
  'load-status': async (params) => ({
    loadNumber: params.get('loadNumber') || 'LOAD-123',
    status: params.get('status') || 'in-transit',
    estimatedDelivery: params.get('estimatedDelivery') || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    carrierName: params.get('carrierName') || 'ABC Trucking',
    currentLocation: params.get('currentLocation') || 'Chicago, IL',
    trackingUrl: params.get('trackingUrl') || 'https://example.com/tracking/load-123',
  }),
  'team-invite': async (params) => ({
    inviterName: params.get('inviterName') || 'John Doe',
    teamName: params.get('teamName') || 'Freight Team',
    inviteLink: params.get('inviteLink') || 'https://example.com/invite/123',
    role: params.get('role') || 'Member',
    expiresIn: params.get('expiresIn') || '7 days',
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
  'load-status': {
    loadNumber: 'LOAD-123',
    status: 'in-transit',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    carrierName: 'ABC Trucking',
    currentLocation: 'Chicago, IL',
    trackingUrl: 'https://example.com/tracking/load-123',
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
  'team-invite': {
    inviterName: 'John Doe',
    teamName: 'Acme Corp',
    inviteUrl: 'https://example.com/invite/123',
    recipientName: 'Jane Smith',
    role: 'Member',
    expiresIn: '7 days',
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

export function getSampleDataFromParams(
  templateName: string,
  params: URLSearchParams
): TemplateData | null {
  const template = sampleData[templateName as TemplateName];
  if (!template) return null;

  // Apply any overrides from the URL parameters
  const result = { ...template };
  Array.from(params.entries()).forEach(([key, value]) => {
    if (value) {
      (result as any)[key] = value;
    }
  });

  return result;
}

/**
 * Get sample data for all templates
 * @param overrides Optional overrides for the sample data
 */
export function getAllSampleData(
  overrides: Partial<Record<TemplateName, Record<string, any>>> = {}
): Record<TemplateName, Record<string, any>> {
  return Object.entries(sampleData).reduce(
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