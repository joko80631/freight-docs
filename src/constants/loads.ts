export const LOAD_STATUSES = ['Pending', 'In Transit', 'Delivered', 'Cancelled'] as const;
export type LoadStatus = (typeof LOAD_STATUSES)[number];

export const LOAD_STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In Transit': 'bg-blue-100 text-blue-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
} as const;

export const LOAD_STATUS_LABELS = {
  'Pending': 'Pending',
  'In Transit': 'In Transit',
  'Delivered': 'Delivered',
  'Cancelled': 'Cancelled',
} as const; 