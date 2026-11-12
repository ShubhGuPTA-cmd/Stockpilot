import { NextRequest, NextResponse } from 'next/server';
const open = ['/login', '/api/login', '/api/health'];
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (open.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const pass = process.env.APP_PASSCODE;
  if (pass && req.cookies.get('passcode')?.value === pass) return NextResponse.next();
  if (pathname.startsWith('/api')) return NextResponse.json({ error: 'Passcode required.' }, { status: 401 });
  return NextResponse.redirect(new URL('/login', req.url));
}
export const config = { matcher: ['/((?!_next|favicon.ico).*)'] };
