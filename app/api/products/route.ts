import { NextResponse } from 'next/server';
import { allProducts, daysLeft, isLow } from '@/lib/inventory';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return NextResponse.json((await allProducts()).map((p) => ({ ...p, daysLeft: daysLeft(p), low: isLow(p) }))); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }); }
}
