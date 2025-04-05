import { Info, CheckCircle, AlertTriangle } from "lucide-react";

/**
 * Formats a timestamp into a human-readable string
 * @param timestamp - The timestamp to format
 * @returns A formatted string like "2 hours ago" or "3 days ago"
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Returns the appropriate icon for an activity type
 * @param type - The activity type (success, warning, error, info)
 * @returns A Lucide icon component
 */
export function getActivityIcon(type: string) {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertTriangle;
    case 'error':
      return AlertTriangle;
    default:
      return Info;
  }
} 