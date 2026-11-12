'use client';
import Badge from '@/components/Badge';
import { inr, useApi } from '@/components/useApi';
type P = { id: number; sku: string; name: string; category: string; unit_cost: number; stock_qty: number; reorder_level: number; reorder_qty: number; daysLeft: number | null; low: boolean; suppliers?: { name: string } };
export default function Products() {
  const { data, error } = useApi<P[]>('/api/products');
  if (error) return <p role="alert" className="rounded bg-red-100 p-3 text-red-800">{error}</p>;
  if (!data) return <p role="status">Loading products…</p>;
  return (
    <section className="card overflow-x-auto"><table className="w-full"><caption className="pb-2 text-left text-lg font-semibold">Products</caption>
      <thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Supplier</th><th>Cost</th><th>Stock</th><th>Reorder level / qty</th><th>Days left</th><th>Status</th></tr></thead>
      <tbody>{data.map((p) => <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.category}</td><td>{p.suppliers?.name}</td><td>{inr(p.unit_cost)}</td><td>{p.stock_qty}</td>
        <td>{p.reorder_level} / {p.reorder_qty}</td><td>{p.daysLeft ?? '–'}</td><td><Badge low={p.low} days={p.daysLeft} /></td></tr>)}</tbody></table></section>);
}
