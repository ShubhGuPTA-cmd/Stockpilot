import { Type, type FunctionDeclaration } from '@google/genai';
import { z } from 'zod';
import { db } from '../supabase';
import { allProducts, daysLeft, isLow } from '../inventory';
import { createPoSchema, daysLeftSchema, lowStockSchema, supplierSchema, updateStockSchema } from '../schemas';

const lowItem = (p: Awaited<ReturnType<typeof allProducts>>[number]) => ({ productId: p.id, name: p.name, category: p.category, supplier: p.suppliers?.name,
  stock: p.stock_qty, reorderLevel: p.reorder_level, reorderQty: p.reorder_qty, daysLeft: daysLeft(p), orderCost: p.reorder_qty * p.unit_cost });
const sameCat = (a: string, b?: string) => !b || a.toLowerCase() === b.toLowerCase();

const impl = {
  async getLowStockItems(a: z.infer<typeof lowStockSchema>) {
    const items = (await allProducts()).filter((p) => isLow(p) && sameCat(p.category, a.category)).map(lowItem);
    return { count: items.length, items };
  },
  async getSupplierDetails(a: z.infer<typeof supplierSchema>) {
    const ps = await allProducts();
    const { data, error } = await db().from('suppliers').select('*');
    if (error) throw new Error(error.message);
    return (data ?? []).filter((s) => !a.name || s.name.toLowerCase().includes(a.name.toLowerCase()))
      .map((s) => ({ ...s, products: ps.filter((p) => p.supplier_id === s.id).length, lowStockProducts: ps.filter((p) => p.supplier_id === s.id && isLow(p)).length }));
  },
  async estimateDaysOfStockLeft(a: z.infer<typeof daysLeftSchema>) {
    const items = (await allProducts()).filter((p) => { const d = daysLeft(p); return d !== null && d <= a.withinDays; })
      .map((p) => ({ productId: p.id, name: p.name, stock: p.stock_qty, dailySales: p.avg_daily_sales, daysLeft: daysLeft(p) }));
    return { withinDays: a.withinDays, count: items.length, items };
  },
  // WRITE: one draft purchase order per supplier, reorder_qty units per low item, skipping items already on an open order.
  async createPurchaseOrder(a: z.infer<typeof createPoSchema>) {
    const d = db();
    const { data: open, error: e1 } = await d.from('purchase_orders').select('id').in('status', ['draft', 'approved']);
    if (e1) throw new Error(e1.message);
    const ids = (open ?? []).map((o) => o.id);
    const { data: onOrder, error: e2 } = ids.length ? await d.from('purchase_order_items').select('product_id').in('po_id', ids) : { data: [], error: null };
    if (e2) throw new Error(e2.message);
    const skip = new Set((onOrder ?? []).map((i) => i.product_id));
    const targets = (await allProducts()).filter((p) => isLow(p) && !skip.has(p.id) && sameCat(p.category, a.category) && (!a.productIds || a.productIds.includes(p.id)));
    if (!targets.length) return { created: [], message: 'No eligible low-stock items: they are healthy or already on an open order.' };
    const bySupplier = new Map<number, typeof targets>();
    for (const p of targets) bySupplier.set(p.supplier_id, [...(bySupplier.get(p.supplier_id) ?? []), p]);
    const created = [];
    for (const [supplierId, ps] of bySupplier) {
      const total = ps.reduce((s, p) => s + p.reorder_qty * p.unit_cost, 0);
      const { data: po, error } = await d.from('purchase_orders').insert({ supplier_id: supplierId, status: 'draft', total_cost: total }).select().single();
      if (error) throw new Error(error.message);
      const { error: ie } = await d.from('purchase_order_items').insert(ps.map((p) => ({ po_id: po.id, product_id: p.id, qty: p.reorder_qty, unit_cost: p.unit_cost })));
      if (ie) { await d.from('purchase_orders').delete().eq('id', po.id); throw new Error(ie.message); }
      created.push({ poId: po.id, supplier: ps[0].suppliers?.name, total, items: ps.map((p) => ({ name: p.name, qty: p.reorder_qty })) });
    }
    return { created };
  },
  // WRITE: set stock after a delivery or stock count.
  async updateStock(a: z.infer<typeof updateStockSchema>) {
    const { data, error } = await db().from('products').update({ stock_qty: a.newQty }).eq('id', a.productId).select('id,name,stock_qty').maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error(`No product with id ${a.productId}.`);
    return { updated: data };
  },
};

const num = (description: string) => ({ type: Type.NUMBER, description });
const str = (description: string) => ({ type: Type.STRING, description });
export const declarations: FunctionDeclaration[] = [
  { name: 'getLowStockItems', description: 'READ. List products where stock is at or below the reorder level. Use for "what needs restocking / reordering".',
    parameters: { type: Type.OBJECT, properties: { category: str('Optional category such as Dairy, Bakery, Produce, Beverages, Staples, Snacks') } } },
  { name: 'getSupplierDetails', description: 'READ. Get supplier contact, lead time and how many of their products are low. Use for questions about suppliers.',
    parameters: { type: Type.OBJECT, properties: { name: str('Optional supplier name or part of it') } } },
  { name: 'estimateDaysOfStockLeft', description: 'READ. Find products that will run out within N days at current daily sales. Use for "will run out in the next N days".',
    parameters: { type: Type.OBJECT, properties: { withinDays: num('Number of days, whole number, default 3') } } },
  { name: 'createPurchaseOrder', description: 'WRITE. Create draft purchase orders (one per supplier) for low-stock items, ordering each item\'s reorder quantity. Use only when the manager asks to create or place orders.',
    parameters: { type: Type.OBJECT, properties: { category: str('Optional category filter'), productIds: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: 'Optional specific product ids' } } } },
  { name: 'updateStock', description: 'WRITE. Set the stock quantity of one product, e.g. after receiving a delivery or a stock count. Needs a productId from a previous tool result.',
    parameters: { type: Type.OBJECT, properties: { productId: num('Product id'), newQty: num('New stock quantity, whole number >= 0') }, required: ['productId', 'newQty'] } },
];

const schemas = { getLowStockItems: lowStockSchema, getSupplierDetails: supplierSchema, estimateDaysOfStockLeft: daysLeftSchema, createPurchaseOrder: createPoSchema, updateStock: updateStockSchema };
// Gemini chooses the tool; our code only validates the arguments with Zod and executes it.
export async function runTool(name: string, args: unknown): Promise<unknown> {
  if (!(name in schemas)) return { error: `Unknown tool ${name}` };
  const parsed = schemas[name as keyof typeof schemas].safeParse(args ?? {});
  if (!parsed.success) return { error: 'Invalid arguments', issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
  try { return await (impl[name as keyof typeof impl] as (a: unknown) => Promise<unknown>)(parsed.data); }
  catch (e) { return { error: (e as Error).message }; }
}
