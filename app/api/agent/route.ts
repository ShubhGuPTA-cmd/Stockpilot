import { NextResponse } from 'next/server';
import { chatSchema } from '@/lib/schemas';
import { runAgent } from '@/lib/agent';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(req: Request) {
  const p = chatSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].message }, { status: 422 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'GEMINI_API_KEY is not set. Check /api/health.' }, { status: 500 });
  try { return NextResponse.json(await runAgent(p.data.message, p.data.history)); }
  catch (e) {
    const m = (e as Error).message;
    const error = /429|quota|RESOURCE_EXHAUSTED/i.test(m) ? 'Gemini quota hit. Wait a minute and try again.'
      : /503|504|UNAVAILABLE|DEADLINE_EXCEEDED|high demand/i.test(m) ? 'Gemini is busy right now (tried twice with a backup model). Please try again in a moment.'
      : /API key|API_KEY|403|PERMISSION_DENIED/i.test(m) ? 'Gemini rejected the API key. Check GEMINI_API_KEY in .env.local.'
      : /404|NOT_FOUND/i.test(m) ? 'Gemini model not found. Check GEMINI_MODEL in .env.local.'
      : `Agent error: ${m}`;
    return NextResponse.json({ error }, { status: 502 });
  }
}
