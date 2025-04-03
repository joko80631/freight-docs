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
  status: 'pending' | 'approved' | 'rejected';
  confidence: number;
}

const mockData: Document[] = [
  {
    id: 'DOC-001',
    name: 'Invoice #12345',
    status: 'approved',
    confidence: 0.95,
  },
  {
    id: 'DOC-002',
    name: 'Bill of Lading',
    status: 'pending',
    confidence: 0.75,
  },
  {
    id: 'DOC-003',
    name: 'Customs Declaration',
    status: 'rejected',
    confidence: 0.45,
  },
];

export default function PlaygroundPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <div className="grid gap-4 md:grid-cols-3">
              <FreightCard variant="default">
                <h3 className="font-semibold">Default Card</h3>
                <p className="mt-2 text-sm text-neutral-600">Basic card with no special styling</p>
              </FreightCard>
              <FreightCard variant="bordered">
                <h3 className="font-semibold">Bordered Card</h3>
                <p className="mt-2 text-sm text-neutral-600">Card with a border</p>
              </FreightCard>
              <FreightCard variant="elevated" hover>
                <h3 className="font-semibold">Elevated Card</h3>
                <p className="mt-2 text-sm text-neutral-600">Card with shadow and hover effect</p>
              </FreightCard>
            </div>
          </section>

          {/* Table Section */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">Table</h2>
            <FreightTable
              data={mockData}
              columns={[
                { header: 'ID', accessorKey: 'id' },
                { header: 'Name', accessorKey: 'name' },
                {
                  header: 'Status',
                  accessorKey: 'status',
                  cell: (value: string) => (
                    <FreightBadge
                      variant={
                        value === 'approved'
                          ? 'success'
                          : value === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {value}
                    </FreightBadge>
                  ),
                },
                {
                  header: 'Confidence',
                  accessorKey: 'confidence',
                  cell: (value: number) => (
                    <FreightBadge
                      variant={
                        value > 0.8
                          ? 'success'
                          : value > 0.6
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {(value * 100).toFixed(0)}%
                    </FreightBadge>
                  ),
                },
              ]}
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