export default function Badge({ low, days }: { low: boolean; days: number | null }) {
  const risk = !low && days !== null && days <= 3;
  const [t, c] = low ? ['Reorder now', 'bg-red-100 text-red-800'] : risk ? ['Runs out soon', 'bg-amber-100 text-amber-900'] : ['Healthy', 'bg-green-100 text-green-800'];
  return <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${c}`}>{t}</span>;
}
