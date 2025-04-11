import { Metadata } from 'next';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import FleetList from '@/components/fleet/FleetList';

export const metadata: Metadata = {
  title: 'Fleet Management - Freight Document Platform',
  description: 'Manage your fleet vehicles',
};

export default function FleetPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Fleet Management" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <FleetList />
          </div>
        </div>
      </main>
    </div>
  );
} 