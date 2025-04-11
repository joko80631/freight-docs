import { z } from 'zod';
import { LoadStatus } from '@/constants/loads';

export const loadFormSchema = z.object({
  load_number: z.string().min(1, 'Load number is required'),
  status: z.enum(['pending', 'in_transit', 'delivered', 'cancelled'] as const),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  delivery_date: z.string().optional(),
  notes: z.string().nullable().optional(),
}); 