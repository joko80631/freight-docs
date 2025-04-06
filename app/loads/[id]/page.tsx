'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SendReminderButton } from '@/components/load/SendReminderButton';
import { Load } from '@/types/load';
import { TeamMember } from '@/types/team';

export default function LoadDetailPage({ params }: { params: { id: string } }) {
  const [load, setLoad] = useState<Load | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [missingDocuments, setMissingDocuments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLoadDetails() {
      try {
        const response = await fetch(`/api/loads/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch load details');
        }

        setLoad(data.load);
        setTeamMembers(data.teamMembers);
        setMissingDocuments(data.missingDocuments);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch load details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchLoadDetails();
  }, [params.id, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!load) {
    return <div>Load not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Load Details</h1>
        <div className="space-x-2">
          {missingDocuments.length > 0 && (
            <SendReminderButton
              loadId={load.id}
              teamMembers={teamMembers}
              documentTypes={missingDocuments}
              onSuccess={() => {
                toast({
                  title: 'Success',
                  description: 'Document reminders sent successfully',
                });
              }}
            />
          )}
          {/* ... existing buttons ... */}
        </div>
      </div>

      {/* ... rest of the load detail page ... */}
    </div>
  );
} 