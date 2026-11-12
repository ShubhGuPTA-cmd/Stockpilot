'use client';
import { useCallback, useEffect, useState } from 'react';
export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null), [error, setError] = useState('');
  const load = useCallback(async () => {
    try { const r = await fetch(url), j = await r.json(); if (!r.ok) throw new Error(j.error || 'Request failed'); setData(j); setError(''); }
    catch (e) { setError((e as Error).message); }
  }, [url]);
  useEffect(() => { load(); }, [load]);
  return { data, error, load };
}
export const inr = (n: number) => '₹' + Math.round(Number(n)).toLocaleString('en-IN');
