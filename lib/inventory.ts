import { db } from './supabase';
export type Product = { id: number; sku: string; name: string; category: string; supplier_id: number; unit_cost: number; stock_qty: number;
  reorder_level: number; reorder_qty: number; avg_daily_sales: number; suppliers?: { name: string; lead_time_days: number } };
export async function allProducts(): Promise<Product[]> {
  const { data, error } = await db().from('products').select('*, suppliers(name, lead_time_days)').order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Product[];
}
// Business rule: low when stock_qty <= reorder_level.
export const isLow = (p: Product) => p.stock_qty <= p.reorder_level;
export const daysLeft = (p: Product) => (p.avg_daily_sales > 0 ? Math.round((p.stock_qty / p.avg_daily_sales) * 10) / 10 : null);
