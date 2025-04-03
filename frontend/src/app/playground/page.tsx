'use client';

import { FreightBadge } from '@/components/freight/FreightBadge';
import { FreightCard } from '@/components/freight/FreightCard';
import { FreightModal } from '@/components/freight/FreightModal';
import { FreightTable } from '@/components/freight/FreightTable';
import { Layout } from '@/components/freight/Layout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Document {
  id: string;
  name: string;
  type: string;
  confidence: number;
}

const mockData: Document[] = [
  {
    id: 'DOC-001',
    name: 'Invoice #12345',
    type: 'invoice',
    confidence: 0.95,
  },
  {
    id: 'DOC-002',
    name: 'Bill of Lading',
    type: 'bill_of_lading',
    confidence: 0.87,
  },
  {
    id: 'DOC-003',
    name: 'Customs Declaration',
    type: 'proof_of_delivery',
    confidence: 0.92,
  },
];

export default function PlaygroundPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data] = useState<Document[]>([
    { id: '1', name: 'Invoice.pdf', type: 'invoice', confidence: 0.95 },
    { id: '2', name: 'BOL.pdf', type: 'bill_of_lading', confidence: 0.87 },
    { id: '3', name: 'POD.pdf', type: 'proof_of_delivery', confidence: 0.92 },
  ]);

  const columns: {
    header: string;
    accessorKey: keyof Document;
    cell?: (value: string | number, row: Document) => React.ReactNode;
  }[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (value) => {
        return <span className="font-medium">{String(value)}</span>;
      },
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (value) => {
        return <FreightBadge>{String(value)}</FreightBadge>;
      },
    },
    {
      header: 'Confidence',
      accessorKey: 'confidence',
      cell: (value) => {
        const confidence = Number(value);
        return (
          <FreightBadge variant={confidence > 0.9 ? 'success' : 'warning'}>
            {Math.round(confidence * 100)}%
          </FreightBadge>
        );
      },
    },
  ];

  return (
    <Layout>
      <Layout.Header>
        <h1 className="text-2xl font-bold">Design System Playground</h1>
      </Layout.Header>
      <Layout.Content>
        <div className="space-y-8 p-6">
          {/* Badges Section */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Badges</h2>
            <div className="flex flex-wrap gap-4">
              <FreightBadge variant="success">Success</FreightBadge>
              <FreightBadge variant="warning">Warning</FreightBadge>
              <FreightBadge variant="error">Error</FreightBadge>
              <FreightBadge variant="info">Info</FreightBadge>
            </div>
          </section>

          {/* Cards Section */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FreightCard>
                <h3 className="font-semibold">Default Card</h3>
                <p className="mt-2 text-sm text-neutral-600">Card with default styling</p>
              </FreightCard>
              <FreightCard variant="bordered">
                <h3 className="font-semibold">Bordered Card</h3>
                <p className="mt-2 text-sm text-neutral-600">Card with a border</p>
              </FreightCard>
              <FreightCard variant="default" hover>
                <h3 className="font-semibold">Hover Card</h3>
                <p className="mt-2 text-sm text-neutral-600">Card with hover effect</p>
              </FreightCard>
            </div>
          </section>

          {/* Table Section */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Table</h2>
            <FreightTable
              data={data}
              columns={columns}
              onRowClick={(row) => console.log('Clicked row:', row)}
            />
          </section>

          {/* Modal Section */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Modal</h2>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <FreightModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Example Modal"
              description="This is a sample modal dialog demonstrating the FreightModal component."
              footer={
                <>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
                </>
              }
            >
              <p>Modal content goes here. You can put any content inside the modal body.</p>
            </FreightModal>
          </section>
        </div>
      </Layout.Content>
    </Layout>
  );
} 