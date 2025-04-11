'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { routes } from '@/config/routes';

// Label mapping for URL segments to human-readable text
const labelMapping = {
  'shipment-details': 'Shipment Details',
  'account-settings': 'Account Settings',
  'team-settings': 'Team Settings',
  'notification-settings': 'Notification Settings',
  'profile-settings': 'Profile Settings',
  'documents': 'Documents',
  'loads': 'Loads',
  'teams': 'Teams',
  'settings': 'Settings',
  'dashboard': 'Dashboard',
  'profile': 'Profile',
  'notifications': 'Notifications',
  'team': 'Team',
  'fleet': 'Fleet',
  'support': 'Support',
  'reports': 'Reports',
};

// Route mapping for segments to centralized routes
const routeMapping = {
  'dashboard': routes.dashboard,
  'loads': routes.loads.index,
  'documents': routes.documents.index,
  'teams': routes.teams.index,
  'settings': routes.settings.index,
  'profile': routes.settings.profile,
  'notifications': routes.settings.notifications,
  'team': routes.settings.team,
  'fleet': routes.fleet.index,
  'support': routes.support,
  'reports': routes.reports,
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 px-4 py-2">
      <Link
        href={routes.dashboard}
        className="flex items-center hover:text-gray-700"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      {segments.map((segment, index) => {
        // Use centralized route if available, otherwise build path
        const href = routeMapping[segment] || `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const label = labelMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <div key={segment} className="flex items-center">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="ml-1 font-medium text-gray-900">{label}</span>
            ) : (
              <Link
                href={href}
                className="ml-1 hover:text-gray-700"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
} 