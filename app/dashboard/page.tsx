import { Metadata } from 'next';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
// import LoadList from '@/components/dashboard/LoadList';
// import DocumentOverview from '@/components/dashboard/DocumentOverview';

export const metadata: Metadata = {
  title: 'Dashboard - Freight Document Platform',
  description: 'Manage your loads and documents',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">Recent Loads</h2>
                {/* <LoadList /> */}
                <p className="text-gray-500">Load list will be implemented here</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900">Document Overview</h2>
                {/* <DocumentOverview /> */}
                <p className="text-gray-500">Document overview will be implemented here</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 