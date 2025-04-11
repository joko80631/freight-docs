import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Styling utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Array utilities
export function safeArray<T>(value: T[] | undefined | null): T[] {
  if (!value || !Array.isArray(value)) {
    return [];
  }
  return value;
}

// File utilities
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return 'Unknown';
  
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Date utilities
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Navigation utilities
export function handleComingSoonFeature(showToast: (title: string, description: string) => void) {
  showToast(
    "Coming Soon",
    "This feature will be available in a future update."
  );
}

export function handleNavigation(
  router: { push: (path: string) => void },
  path: string,
  showToast?: (title: string, description: string) => void
) {
  if (path.includes('coming-soon')) {
    if (showToast) {
      handleComingSoonFeature(showToast);
    }
    return;
  }
  router.push(path);
} 