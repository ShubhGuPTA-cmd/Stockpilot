'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const links = [['/', 'Dashboard'], ['/products', 'Products'], ['/purchase-orders', 'Purchase orders'], ['/agent', 'Agent chat']];
export default function Nav() {
  const path = usePathname();
  if (path === '/login') return null;
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4">
      <span className="text-2xl font-bold tracking-tight">StockPilot</span>
      <nav aria-label="Main" className="flex flex-wrap gap-1">
        {links.map(([href, label]) => (
          <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}
            className={`rounded-md px-3 py-2 ${path === href ? 'bg-teal text-white' : 'hover:bg-teal/10'}`}>{label}</Link>))}
      </nav>
    </header>
  );
}
