'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/teamStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LOAD_STATUS_LABELS } from '@/config/constants';
import { TableSkeleton } from '@/components/ui/skeleton';

export default function LoadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();
  const [load, setLoad] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoad = async () => {
      if (!currentTeam?.id || !params.id) return;

      try {
        const { data, error } = await supabase
          .from('loads')
          .select('*')
          .eq('id', params.id)
          .eq('team_id', currentTeam.id)
          .single();

        if (error) throw error;
        setLoad(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoad();
  }, [params.id, currentTeam?.id, supabase]);

  const handleDelete = async () => {
    if (!load?.id) return;

    try {
      const { error } = await supabase
        .from('loads')
        .delete()
        .eq('id', load.id);

      if (error) throw error;
      router.push('/loads');
    } catch (err) {
      console.error('Error deleting load:', err);
    }
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Error loading load details: {error}
        </div>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          Load not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/loads')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Load Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/loads/${load.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <Badge variant={load.status === 'active' ? 'default' : 'secondary'}>
                {LOAD_STATUS_LABELS[load.status]}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
              <p>{load.customer_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Origin</h3>
              <p>{load.origin}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Destination</h3>
              <p>{load.destination}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Pickup Date</h3>
              <p>{new Date(load.pickup_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Delivery Date</h3>
              <p>{new Date(load.delivery_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
              <p>{new Date(load.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 