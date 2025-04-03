'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/teamStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from 'lucide-react';
import { LOAD_STATUSES, LOAD_STATUS_LABELS } from '@/config/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast";

export default function EditLoadPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();
  const { toast } = useToast();
  const [load, setLoad] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    origin: '',
    destination: '',
    status: '',
    pickup_date: '',
    delivery_date: ''
  });

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
        setFormData({
          customer_name: data.customer_name,
          origin: data.origin,
          destination: data.destination,
          status: data.status,
          pickup_date: data.pickup_date,
          delivery_date: data.delivery_date
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoad();
  }, [params.id, currentTeam?.id, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!load?.id) return;

    try {
      const { error } = await supabase
        .from('loads')
        .update(formData)
        .eq('id', load.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Load updated successfully",
      });
      router.push(`/loads/${load.id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update load",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Skeleton />;
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
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/loads/${load.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Load</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOAD_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickup_date">Pickup Date</Label>
              <Input
                id="pickup_date"
                type="date"
                value={formData.pickup_date}
                onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_date">Delivery Date</Label>
              <Input
                id="delivery_date"
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/loads/${load.id}`)}
          >
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
} 