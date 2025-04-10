'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type FleetStats = {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
};

type MaintenanceAlert = {
  id: string;
  vehicle_number: string;
  issue: string;
  due_date: string;
};

export default function FleetStats() {
  const [stats, setStats] = useState<FleetStats>({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
  });
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch vehicle stats
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('status');

        if (vehiclesError) throw vehiclesError;

        const stats = {
          total: vehicles?.length || 0,
          active: vehicles?.filter((v) => v.status === 'Active').length || 0,
          maintenance: vehicles?.filter((v) => v.status === 'Maintenance').length || 0,
          inactive: vehicles?.filter((v) => v.status === 'Inactive').length || 0,
        };

        setStats(stats);

        // Fetch maintenance alerts
        const { data: maintenanceAlerts, error: alertsError } = await supabase
          .from('maintenance_alerts')
          .select('*')
          .order('due_date', { ascending: true })
          .limit(5);

        if (alertsError) throw alertsError;
        setAlerts(maintenanceAlerts || []);
      } catch (error) {
        console.error('Error fetching fleet stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
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
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-600">Active Vehicles</p>
          <p className="mt-1 text-2xl font-semibold text-green-900">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-yellow-600">In Maintenance</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-900">{stats.maintenance}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-red-600">Inactive</p>
          <p className="mt-1 text-2xl font-semibold text-red-900">{stats.inactive}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-600">Total Fleet</p>
          <p className="mt-1 text-2xl font-semibold text-blue-900">{stats.total}</p>
        </div>
      </div>

      {/* Maintenance Alerts */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Maintenance Alerts</h4>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  {alert.vehicle_number}
                </p>
                <p className="text-xs text-yellow-700">{alert.issue}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-yellow-700">
                  Due: {new Date(alert.due_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 