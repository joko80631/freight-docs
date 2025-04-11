'use client';

import React, { useState, useEffect } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Truck } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

interface FleetVehicle {
  id: string;
  vehicle_number: string;
  type: string;
  status: string;
  last_maintenance: string;
  next_maintenance: string;
  created_at: string;
}

export default function FleetList() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const { data, error } = await supabase
          .from('fleet_vehicles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVehicles(data || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, [supabase]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Fleet Vehicles</h3>
        <Link
          href="/fleet/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Vehicle
        </Link>
      </div>
      
      <div className="space-y-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <Link
                href={`/fleet/${vehicle.id}`}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {vehicle.vehicle_number}
              </Link>
              <span className={`text-sm px-2 py-1 rounded-full ${
                vehicle.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : vehicle.status === 'maintenance'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {vehicle.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Link href={`/fleet/${vehicle.id}/edit`}>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/fleet/${vehicle.id}/maintenance`}>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 