import { z } from 'zod';
import { LoadStatus } from '@/types/load';

export const loadFormSchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
  status: z.nativeEnum(LoadStatus),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  weight: z.number().min(0, 'Weight must be greater than 0'),
  dimensions: z.object({
    length: z.number().min(0, 'Length must be greater than 0'),
    width: z.number().min(0, 'Width must be greater than 0'),
    height: z.number().min(0, 'Height must be greater than 0'),
  }),
  notes: z.string().optional(),
});

export type LoadFormData = z.infer<typeof loadFormSchema>; 