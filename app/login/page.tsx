'use client';
import { useState } from 'react';
export default function Login() {
  const [err, setErr] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode: new FormData(e.currentTarget).get('passcode') }) });
    if (r.ok) location.href = '/'; else setErr((await r.json()).error);
  }
  return (
    <form onSubmit={submit} className="card mx-auto mt-24 max-w-sm space-y-3">
      <h1 className="text-xl font-bold">StockPilot</h1>
      <label className="block">Team passcode<input name="passcode" type="password" required className="mt-1 w-full rounded border border-slate-400 p-2" /></label>
      {err && <p role="alert" className="text-red-700">{err}</p>}
      <button className="btn-primary w-full">Enter</button>
    </form>
  );
}
