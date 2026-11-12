'use client';
import { useRef, useState } from 'react';
type Step = { tool: string; args: unknown; result: unknown };
type Msg = { role: 'user' | 'model'; text: string; steps?: Step[] };
const PROMPTS = ['What do I need to reorder this week?', 'Which items will run out in the next 3 days?', 'Create purchase orders for all low-stock dairy items.'];
export default function Agent() {
  const [msgs, setMsgs] = useState<Msg[]>([]), [busy, setBusy] = useState(false), [input, setInput] = useState(''), end = useRef<HTMLDivElement>(null);
  async function send(text: string) {
    if (!text.trim() || busy) return;
    const history = msgs.filter((m) => !m.text.startsWith('⚠')).slice(-10).map(({ role, text }) => ({ role, text }));
    setMsgs((m) => [...m, { role: 'user', text }]); setInput(''); setBusy(true);
    try {
      const r = await fetch('/api/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history }), signal: AbortSignal.timeout(150000) }), j = await r.json();
      setMsgs((m) => [...m, { role: 'model', text: r.ok ? j.reply : `⚠ ${j.error}`, steps: j.steps }]);
    } catch (e) { setMsgs((m) => [...m, { role: 'model', text: (e as Error).name === 'TimeoutError' ? '⚠ The agent took too long. Check the terminal running npm run dev for [agent] logs.' : '⚠ Network error. Try again.' }]); }
    setBusy(false); setTimeout(() => end.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }
  return (
    <section className="card space-y-3">
      <h1 className="text-lg font-semibold">Agent chat</h1>
      <div className="flex flex-wrap gap-2">{PROMPTS.map((p) => <button key={p} className="btn text-left" disabled={busy} onClick={() => send(p)}>{p}</button>)}</div>
      <div className="max-h-[55vh] space-y-3 overflow-y-auto" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'ml-auto max-w-[85%] rounded-lg bg-teal p-3 text-white' : 'max-w-[90%] rounded-lg bg-slate-100 p-3'}>
            <p className="whitespace-pre-wrap">{m.text}</p>
            {!!m.steps?.length && <details className="mt-2 text-sm"><summary className="cursor-pointer font-semibold">Agent used {m.steps.length} tool call{m.steps.length > 1 ? 's' : ''}: {m.steps.map((s) => s.tool).join(' → ')}</summary>
              {m.steps.map((s, k) => <pre key={k} className="mt-2 overflow-x-auto rounded bg-white p-2">{s.tool}({JSON.stringify(s.args)}){'\n'}{JSON.stringify(s.result, null, 1)}</pre>)}</details>}
          </div>))}
        {busy && <p role="status">Agent is working…</p>}<div ref={end} />
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <label className="sr-only" htmlFor="q">Message</label>
        <input id="q" value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} placeholder="Ask about stock, suppliers or orders…" className="min-h-[40px] flex-1 rounded border border-slate-400 px-3" />
        <button className="btn-primary" disabled={busy}>Send</button></form>
    </section>);
}
