export type LoadStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled';

export const LOAD_STATUS_LABELS: Record<LoadStatus, string> = {
  pending: 'Pending',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const LOAD_STATUS_COLORS: Record<LoadStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}; 