import { z } from 'zod';

export const shopItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  description: z
    .string()
    .min(1, 'Description is required'),
  imageUrl: z
    .string()
    .url('Invalid URL')
    .optional()
    .or(z.literal('')),
  coinPrice: z
    .number()
    .min(1, 'Price must be at least 1 coin'),
  stock: z
    .number()
    .min(0, 'Stock cannot be negative')
    .optional()
    .nullable(),
  minLevel: z
    .number()
    .min(1, 'Minimum level must be at least 1')
    .max(60, 'Maximum level is 60'),
  isActive: z.boolean(),
});

export type ShopItemFormData = z.infer<typeof shopItemSchema>;

export const grantCoinsSchema = z.object({
  amount: z
    .number()
    .min(1, 'Amount must be at least 1'),
  reason: z
    .string()
    .min(1, 'Reason is required')
    .max(200, 'Reason is too long'),
});

export type GrantCoinsFormData = z.infer<typeof grantCoinsSchema>;
