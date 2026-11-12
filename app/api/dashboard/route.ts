import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { allProducts, daysLeft, isLow } from '@/lib/inventory';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const ps = await allProducts();
    const { count } = await db().from('purchase_orders').select('id', { count: 'exact', head: true }).in('status', ['draft', 'approved']);
    const attention = ps.filter((p) => isLow(p) || (daysLeft(p) ?? 99) <= 3).map((p) => ({ ...p, daysLeft: daysLeft(p), low: isLow(p) }));
    return NextResponse.json({ total: ps.length, lowCount: ps.filter(isLow).length, stockValue: Math.round(ps.reduce((s, p) => s + p.stock_qty * p.unit_cost, 0)),
      openPOs: count ?? 0, reorderCost: Math.round(ps.filter(isLow).reduce((s, p) => s + p.reorder_qty * p.unit_cost, 0)), attention });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }); }
}
