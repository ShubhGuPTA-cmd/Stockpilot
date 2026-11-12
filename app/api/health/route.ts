import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
export const dynamic = 'force-dynamic';
export async function GET() {
  const env = Object.fromEntries(['GEMINI_API_KEY', 'GEMINI_MODEL', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'APP_PASSCODE'].map((k) => [k, Boolean(process.env[k])]));
  let database = 'ok';
  try { const { error } = await db().from('products').select('id').limit(1); if (error) database = error.message; } catch (e) { database = (e as Error).message; }
  return NextResponse.json({ env, database });
}
