'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Vehicle = {
  id: string;
  vehicle_number: string;
  type: string;
  status: string;
  last_maintenance: string;
  next_maintenance: string;
  created_at: string;
};

export default function FleetList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Fleet Vehicles</h3>
        <Link
          href="/fleet/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Vehicle
        </Link>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                Vehicle Number
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Last Maintenance
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Next Maintenance
              </th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                  <Link
                    href={`/fleet/${vehicle.id}`}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {vehicle.vehicle_number}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {vehicle.type}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      vehicle.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : vehicle.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {vehicle.last_maintenance ? new Date(vehicle.last_maintenance).toLocaleDateString() : 'Never'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {vehicle.next_maintenance ? new Date(vehicle.next_maintenance).toLocaleDateString() : 'Not scheduled'}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link
                    href={`/fleet/${vehicle.id}/maintenance`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Schedule Maintenance
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 