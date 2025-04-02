'use client';

import { Toaster } from 'react-hot-toast';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import Breadcrumbs from './Breadcrumbs';
import Sidebar from './Sidebar';

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex-grow flex">
        <Sidebar />
        <div className="flex-grow flex flex-col">
          <Breadcrumbs />
          <main className="flex-grow px-4 py-6">
            {children}
          </main>
        </div>
      </div>
      <AppFooter />
      <Toaster position="top-right" />
    </div>
  );
} 