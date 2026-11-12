'use client';
import Link from 'next/link';
import Badge from '@/components/Badge';
import { inr, useApi } from '@/components/useApi';
type Row = { id: number; name: string; category: string; stock_qty: number; reorder_level: number; daysLeft: number | null; low: boolean; suppliers?: { name: string } };
type D = { total: number; lowCount: number; stockValue: number; openPOs: number; reorderCost: number; attention: Row[] };
export default function Dashboard() {
  const { data: d, error } = useApi<D>('/api/dashboard');
  if (error) return <p role="alert" className="rounded bg-red-100 p-3 text-red-800">{error}. Check /api/health and that the seed SQL has run.</p>;
  if (!d) return <p role="status">Loading inventory…</p>;
  const kpis: [string, string, string][] = [[String(d.lowCount), `of ${d.total} products are at or below reorder level`, 'border-l-8 border-l-tape'],
    [inr(d.reorderCost), 'to restock all low items', ''], [inr(d.stockValue), 'stock value on hand', ''], [String(d.openPOs), 'open purchase orders', '']];
  return (<>
    <section aria-label="Inventory health" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map(([v, l, c]) => <div key={l} className={`card ${c}`}><b className="block text-3xl">{v}</b><span className="text-slate-600">{l}</span></div>)}
    </section>
    <section className="card overflow-x-auto">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Needs attention</h2>
        <Link href="/agent" className="btn-primary inline-flex items-center">Ask the agent to restock</Link></div>
      <table className="w-full"><caption className="sr-only">Low stock and fast-moving items</caption>
        <thead><tr><th>Product</th><th>Supplier</th><th>Stock</th><th>Reorder at</th><th>Days left</th><th>Status</th></tr></thead>
        <tbody>{d.attention.map((p) => <tr key={p.id}><td>{p.name}</td><td>{p.suppliers?.name}</td><td>{p.stock_qty}</td><td>{p.reorder_level}</td><td>{p.daysLeft ?? '–'}</td><td><Badge low={p.low} days={p.daysLeft} /></td></tr>)}</tbody></table>
    </section></>);
}
