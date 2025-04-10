import { z } from 'zod';
import { LOAD_STATUSES } from '@/src/constants/loads';

export const loadFormSchema = z.object({
  load_number: z.string()
    .min(1, 'Load number is required')
    .max(50, 'Load number must be less than 50 characters')
    .trim(),
  origin: z.string()
    .min(1, 'Origin is required')
    .max(100, 'Origin must be less than 100 characters')
    .trim(),
  destination: z.string()
    .min(1, 'Destination is required')
    .max(100, 'Destination must be less than 100 characters')
    .trim(),
  status: z.string()
    .refine((val) => LOAD_STATUSES.includes(val as any), {
      message: 'Invalid status',
    }),
  customer_name: z.string()
    .max(100, 'Customer name must be less than 100 characters')
    .trim()
    .optional(),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .trim()
    .optional(),
});

export type LoadFormData = z.infer<typeof loadFormSchema>; 