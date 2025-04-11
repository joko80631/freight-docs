'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { routes } from '@/config/routes';
import {
  LayoutDashboard,
  FileText,
  Truck,
  Users,
  Settings,
  HelpCircle,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: routes.dashboard,
    icon: LayoutDashboard,
  },
  {
    name: 'Loads',
    href: routes.loads.index,
    icon: Truck,
  },
  {
    name: 'Documents',
    href: routes.documents.index,
    icon: FileText,
  },
  {
    name: 'Teams',
    href: routes.teams.index,
    icon: Users,
  },
  {
    name: 'Settings',
    href: routes.settings.index,
    icon: Settings,
  },
  {
    name: 'Help',
    href: routes.support,
    icon: HelpCircle,
  },
];

export function Sidebar({ isCollapsed }) {
  const pathname = usePathname();

  const isRouteActive = (href) => pathname === href;

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-all duration-300",
      isCollapsed && "w-16"
    )}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href={routes.dashboard} className="flex items-center gap-2 font-semibold">
          <span className={cn(isCollapsed && "sr-only")}>Freight</span>
        </Link>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = isRouteActive(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
} 