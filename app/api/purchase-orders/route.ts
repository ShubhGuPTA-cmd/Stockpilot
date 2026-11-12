import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { poStatusSchema } from '@/lib/schemas';
export const dynamic = 'force-dynamic';
export async function GET() {
  const { data, error } = await db().from('purchase_orders').select('id,status,total_cost,created_at,suppliers(name),purchase_order_items(qty,unit_cost,products(name))').order('created_at', { ascending: false });
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data);
}
export async function PATCH(req: Request) {
  const p = poStatusSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].message }, { status: 422 });
  const { data, error } = await db().from('purchase_orders').update({ status: p.data.status }).eq('id', p.data.id).eq('status', 'draft').select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return data ? NextResponse.json(data) : NextResponse.json({ error: 'Only draft orders can be changed.' }, { status: 404 });
}
