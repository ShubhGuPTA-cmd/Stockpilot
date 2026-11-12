import { z } from 'zod';
export const lowStockSchema = z.object({ category: z.string().trim().min(1).max(40).optional() });
export const supplierSchema = z.object({ name: z.string().trim().min(1).max(80).optional() });
export const daysLeftSchema = z.object({ withinDays: z.number().int().min(1).max(60).default(3) });
export const createPoSchema = z.object({
  category: z.string().trim().min(1).max(40).optional(),
  productIds: z.array(z.number().int().positive()).max(50).optional(),
});
export const updateStockSchema = z.object({
  productId: z.number().int().positive(), newQty: z.number().int().min(0).max(1_000_000),
});
export const poStatusSchema = z.object({ id: z.number().int().positive(), status: z.enum(['approved', 'cancelled']) });
export const chatSchema = z.object({
  message: z.string().trim().min(1, 'Type a request first.').max(1000),
  history: z.array(z.object({ role: z.enum(['user', 'model']), text: z.string().max(4000) })).max(12).default([]),
});
