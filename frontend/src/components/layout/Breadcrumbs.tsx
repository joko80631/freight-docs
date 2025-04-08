import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Label mapping for URL segments to human-readable text
const labelMapping: Record<string, string> = {
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
};

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname with label mapping
  const items: BreadcrumbItem[] = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => ({
      label: labelMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: "/" + array.slice(0, index + 1).join("/"),
    }));

  if (items.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 px-4 py-3 text-sm text-muted-foreground border-b">
      <Link 
        href="/" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link
            href={item.href}
            className={`hover:text-foreground transition-colors ${
              index === items.length - 1 ? "font-medium text-foreground" : ""
            }`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
} 