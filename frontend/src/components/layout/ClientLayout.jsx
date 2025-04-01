'use client';

import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import Breadcrumbs from './Breadcrumbs';

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-grow flex flex-col">
        <Breadcrumbs />
        <main className="flex-grow px-4 py-6">
          {children}
        </main>
      </div>
      <AppFooter />
    </div>
  );
} 