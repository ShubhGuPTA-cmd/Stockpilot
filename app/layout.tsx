import './globals.css';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
export const metadata: Metadata = { title: 'StockPilot', description: 'Inventory restock agent' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>
    <div className="h-2.5" style={{ background: 'repeating-linear-gradient(-45deg,#f2c230 0 14px,#16262d 14px 28px)' }} aria-hidden />
    <Nav /><main className="mx-auto max-w-6xl space-y-5 px-4 pb-12">{children}</main>
  </body></html>);
}
