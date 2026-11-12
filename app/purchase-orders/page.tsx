'use client';
import { useState } from 'react';
import { inr, useApi } from '@/components/useApi';
type PO = { id: number; status: string; total_cost: number; created_at: string; suppliers: { name: string }; purchase_order_items: { qty: number; unit_cost: number; products: { name: string } }[] };
export default function POs() {
  const { data, error, load } = useApi<PO[]>('/api/purchase-orders');
  const [msg, setMsg] = useState('');
  async function set(id: number, status: 'approved' | 'cancelled') {
    const r = await fetch('/api/purchase-orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    setMsg(r.ok ? `Order #${id} ${status}.` : (await r.json()).error); load();
  }
  if (error) return <p role="alert" className="rounded bg-red-100 p-3 text-red-800">{error}</p>;
  if (!data) return <p role="status">Loading orders…</p>;
  return (<section className="space-y-3"><h1 className="text-lg font-semibold">Purchase orders</h1><p role="status" aria-live="polite">{msg}</p>
    {data.length === 0 && <p className="card">No purchase orders yet. Ask the agent: “Create purchase orders for all low-stock items.”</p>}
    {data.map((o) => (<article key={o.id} className="card">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">#{o.id} · {o.suppliers?.name} · {inr(o.total_cost)}</h2>
        <div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-0.5">{o.status}</span>
          {o.status === 'draft' && <><button className="btn-primary" onClick={() => set(o.id, 'approved')}>Approve</button><button className="btn" onClick={() => set(o.id, 'cancelled')}>Cancel</button></>}</div></div>
      <ul className="mt-2 list-disc pl-5">{o.purchase_order_items.map((i, k) => <li key={k}>{i.products?.name}: {i.qty} units × {inr(i.unit_cost)}</li>)}</ul></article>))}</section>);
}
