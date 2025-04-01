'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 px-4 py-2">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-gray-700"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);

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