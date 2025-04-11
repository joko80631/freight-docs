'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { useTeamStore } from '@/src/store/team-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
// import type { Toast } from '@/components/ui/use-toast';

interface LoadFormData {
  load_number: string;
  origin: string;
  destination: string;
  status: string;
  customer_name?: string;
}

export default function CreateLoadPage() {
  const router = useRouter();
  // const { currentTeam } = useTeamStore();
  // const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoadFormData>({
    load_number: '',
    origin: '',
    destination: '',
    status: 'Pending',
    customer_name: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Temporarily hardcoded team ID for testing
    const teamId = 'temp-team-id';
    
    // if (!currentTeam?.id) {
    //   toast({
    //     title: 'Error',
    //     description: 'Please select a team first.',
    //     type: 'error',
    //   });
    //   return;
    // }

    setIsLoading(true);
    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from('loads')
        .insert({
          ...formData,
          team_id: teamId, // Using hardcoded team ID
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Load created successfully.',
        // type: 'success',
      });

      router.push('/loads');
    } catch (error) {
      console.error('Error creating load:', error);
      toast({
        title: 'Error',
        description: 'Failed to create load. Please try again.',
        // type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Temporarily removing team check
  // if (!currentTeam) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <p className="text-gray-500">Please select a team to create a load.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Create New Load</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="load_number">Load Number</Label>
                <Input
                  id="load_number"
                  value={formData.load_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('load_number', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('customer_name', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('origin', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('destination', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                {/* Replaced Select with Input */}
                <Input
                  id="status"
                  value={formData.status}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('status', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/loads')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Load'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 