'use client';

import { useState } from 'react';
import { 
  FreightCard, 
  FreightBadge, 
  FreightTable, 
  FreightButton,
  DocumentConfidenceLegend,
  Timeline,
  ClassificationDisplay
} from '@/components/freight';
import { Plus, Trash, Edit, Search, Filter, ArrowRight } from 'lucide-react';

export default function PlaygroundPage() {
  const [isLoading, setIsLoading] = useState(false);

  const sampleTableData = [
    { id: '1', reference: 'REF-001', client: 'Acme Corp', route: 'LA → NY', created: '2023-04-01', status: 'In Transit', documents: 75 },
    { id: '2', reference: 'REF-002', client: 'Globex Inc', route: 'CHI → MIA', created: '2023-04-02', status: 'Delivered', documents: 100 },
    { id: '3', reference: 'REF-003', client: 'Initech', route: 'SEA → DAL', created: '2023-04-03', status: 'Pending', documents: 25 },
  ];

  const sampleTableColumns = [
    { header: 'Reference', accessorKey: 'reference' as const },
    { header: 'Client', accessorKey: 'client' as const },
    { header: 'Route', accessorKey: 'route' as const },
    { header: 'Created', accessorKey: 'created' as const },
    { 
      header: 'Status', 
      accessorKey: 'status' as const,
      cell: (value: string | number, row: typeof sampleTableData[0]) => (
        <FreightBadge 
          variant={
            String(value) === 'Delivered' ? 'success' : 
            String(value) === 'In Transit' ? 'warning' : 
            'error'
          }
        >
          {String(value)}
        </FreightBadge>
      )
    },
    { 
      header: 'Documents', 
      accessorKey: 'documents' as const,
      align: 'right' as const,
      cell: (value: string | number, row: typeof sampleTableData[0]) => (
        <div className="flex items-center justify-end">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Number(value)}%` }}
            />
          </div>
          <span className="ml-2 text-sm">{Number(value)}%</span>
        </div>
      )
    },
  ];

  const sampleTimelineItems = [
    {
      title: 'Load Created',
      description: 'New load REF-001 created by John Doe',
      metadata: { time: '2 hours ago', user: 'John Doe' },
      variant: 'info' as const,
    },
    {
      title: 'Documents Uploaded',
      description: '3 documents uploaded for load REF-001',
      metadata: { time: '1 hour ago', user: 'Jane Smith' },
      variant: 'success' as const,
    },
    {
      title: 'Load In Transit',
      description: 'Load REF-001 is now in transit',
      metadata: { time: '30 minutes ago', user: 'System' },
      variant: 'warning' as const,
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">FreightDocs Design System Playground</h1>
      
      {/* FreightCard Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">FreightCard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FreightCard>
            <p>Default card with content</p>
          </FreightCard>
          
          <FreightCard variant="subtle">
            <p>Subtle variant with light gray background</p>
          </FreightCard>
          
          <FreightCard 
            header={{ 
              title: 'Card with Header', 
              actions: <FreightButton size="small" variant="secondary">Action</FreightButton> 
            }}
          >
            <p>Card with header and action button</p>
          </FreightCard>
          
          <FreightCard 
            header={{ title: 'Card with Header and Footer' }}
            footer={<div className="flex justify-end"><FreightButton size="small">Save</FreightButton></div>}
          >
            <p>Card with header and footer</p>
          </FreightCard>
        </div>
      </section>
      
      {/* FreightBadge Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">FreightBadge</h2>
        <div className="flex flex-wrap gap-4">
          <FreightBadge>Default</FreightBadge>
          <FreightBadge variant="success">Success</FreightBadge>
          <FreightBadge variant="warning">Warning</FreightBadge>
          <FreightBadge variant="error">Error</FreightBadge>
          <FreightBadge variant="neutral">Neutral</FreightBadge>
          <FreightBadge variant="confidence" confidence={95}>High</FreightBadge>
          <FreightBadge variant="confidence" confidence={75}>Medium</FreightBadge>
          <FreightBadge variant="confidence" confidence={45}>Low</FreightBadge>
        </div>
      </section>
      
      {/* FreightButton Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">FreightButton</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <FreightButton>Primary Button</FreightButton>
            <FreightButton variant="secondary">Secondary Button</FreightButton>
            <FreightButton variant="danger">Danger Button</FreightButton>
            <FreightButton variant="icon"><Plus /></FreightButton>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <FreightButton size="small">Small Primary</FreightButton>
            <FreightButton size="small" variant="secondary">Small Secondary</FreightButton>
            <FreightButton size="small" variant="danger">Small Danger</FreightButton>
            <FreightButton size="small" variant="icon"><Trash /></FreightButton>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <FreightButton leftIcon={<Plus />}>With Left Icon</FreightButton>
            <FreightButton rightIcon={<ArrowRight />}>With Right Icon</FreightButton>
            <FreightButton 
              isLoading={isLoading} 
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 2000);
              }}
            >
              Loading State
            </FreightButton>
          </div>
        </div>
      </section>
      
      {/* FreightTable Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">FreightTable</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Table</h3>
            <FreightTable 
              data={sampleTableData} 
              columns={sampleTableColumns} 
              showChevron 
              onRowClick={(row) => alert(`Clicked row: ${row.reference}`)}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading State</h3>
            <FreightTable isLoading />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Empty State</h3>
            <FreightTable 
              data={[]} 
              emptyState={
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No data available</p>
                  <FreightButton>Create New</FreightButton>
                </div>
              } 
            />
          </div>
        </div>
      </section>
      
      {/* DocumentConfidenceLegend Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">DocumentConfidenceLegend</h2>
        <div className="max-w-md">
          <DocumentConfidenceLegend />
        </div>
      </section>
      
      {/* Timeline Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Timeline</h2>
        <div className="max-w-md">
          <Timeline items={sampleTimelineItems} />
        </div>
      </section>
      
      {/* ClassificationDisplay Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">ClassificationDisplay</h2>
        <div className="space-y-4 max-w-md">
          <ClassificationDisplay 
            documentType="Bill of Lading" 
            confidence={95} 
            reason="Document contains standard BOL format with carrier information and shipment details."
          />
          <ClassificationDisplay 
            documentType="Commercial Invoice" 
            confidence={75} 
            reason="Document appears to be an invoice but missing some standard fields."
          />
          <ClassificationDisplay 
            documentType="Unknown Document" 
            confidence={45} 
            reason="Unable to determine document type with high confidence."
          />
        </div>
      </section>
    </div>
  );
} 