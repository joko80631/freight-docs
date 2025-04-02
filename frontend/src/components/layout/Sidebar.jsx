'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTeamStore } from '@/store/teamStore';
import {
  LayoutDashboard,
  Truck,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Loads', href: '/loads', icon: Truck },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Teams', href: '/teams', icon: Users },
];

const systemLinks = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentTeam } = useTeamStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Handle mobile menu state
  useEffect(() => {
    if (isDesktop) {
      setIsMobileOpen(false);
    }
  }, [isDesktop]);

  // Handle body scroll lock when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  // Get team initials for avatar
  const getTeamInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate deterministic color for team avatar
  const getTeamColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Check if a route is active (including nested routes)
  const isRouteActive = (href) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className={cn(
      "flex flex-col h-full bg-background border-r border-border shadow-sm",
      isCollapsed ? "w-16" : "w-60"
    )}>
      {/* Team Section */}
      <div className="p-4 border-b border-border">
        {currentTeam ? (
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium",
              getTeamColor(currentTeam.name)
            )}>
              {getTeamInitials(currentTeam.name)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentTeam.name}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded-full w-3/4"></div>
            <div className="h-4 bg-muted rounded mt-2 w-1/2"></div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
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

      {/* System Links */}
      <div className="border-t border-border py-4">
        <ul className="space-y-1 px-2">
          {systemLinks.map((item) => {
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
      </div>

      {/* Collapse Toggle */}
      {isDesktop && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );

  // Mobile Drawer
  if (!isDesktop) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile Drawer */}
        <div
          className={cn(
            "fixed inset-0 z-50 md:hidden",
            isMobileOpen ? "visible" : "invisible"
          )}
        >
          {/* Backdrop */}
          <div
            className={cn(
              "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200",
              isMobileOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 w-60 bg-background border-r border-border transform transition-transform duration-200 ease-in-out",
              isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <SidebarContent />
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return <SidebarContent />;
} 