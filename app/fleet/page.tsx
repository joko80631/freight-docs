import { Metadata } from 'next';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import FleetList from '@/components/fleet/FleetList';
import FleetStats from '@/components/fleet/FleetStats';

export const metadata: Metadata = {
  title: 'Fleet Management - Freight Document Platform',
  description: 'Manage your fleet vehicles and assignments',
};

export default function FleetPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Fleet Vehicles</h2>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Vehicle
                  </button>
                </div>
                <FleetList />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">Fleet Overview</h2>
                <FleetStats />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 