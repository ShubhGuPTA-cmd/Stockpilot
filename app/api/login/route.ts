import { NextResponse } from 'next/server';
import { z } from 'zod';
export async function POST(req: Request) {
  const p = z.object({ passcode: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Enter the passcode.' }, { status: 422 });
  if (!process.env.APP_PASSCODE || p.data.passcode !== process.env.APP_PASSCODE) return NextResponse.json({ error: 'Wrong passcode.' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('passcode', p.data.passcode, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 86400 });
  return res;
}
