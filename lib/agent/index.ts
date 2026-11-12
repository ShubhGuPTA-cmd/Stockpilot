import { GoogleGenAI, type Content } from '@google/genai';
import { declarations, runTool } from './tools';

const SYSTEM = `You are StockPilot, an inventory restock assistant for a supermarket store manager.
Always use tools for facts: getLowStockItems, getSupplierDetails, estimateDaysOfStockLeft. Never guess stock numbers.
Use createPurchaseOrder only when the manager asks to create/place orders; use updateStock only for explicit stock changes.
Low stock means stock <= reorder level. One draft purchase order is created per supplier.
After tools run, answer briefly in plain English with item names, quantities and costs in rupees (₹).
If the request is unclear or unrelated to inventory, ask one short clarifying question or say what you can help with. If a tool returns an error, explain it simply.`;

// Gemini returns 503/429/500 during demand spikes. Retry with backoff, then fall back to a second model.
const isTransient = (e: unknown) => /\b(503|504|500|429|DEADLINE_EXCEEDED|UNAVAILABLE|overloaded|high demand|RESOURCE_EXHAUSTED)\b/i.test((e as Error)?.message ?? '');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function generateWithRetry(ai: GoogleGenAI, contents: Content[]) {
  const fallbacks = (process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite,gemini-3.7-flash').split(',').map((m) => m.trim()).filter(Boolean);
  const models = [process.env.GEMINI_MODEL || 'gemini-3.5-flash', ...fallbacks];
  let last: unknown;
  for (const model of [...new Set(models)]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const t0 = Date.now();
      try {
        console.log(`[agent] Gemini call model=${model} attempt=${attempt + 1}`);
        const res = await ai.models.generateContent({ model, contents,
          config: { systemInstruction: SYSTEM, tools: [{ functionDeclarations: declarations }], httpOptions: { timeout: 40000 } } });
        console.log(`[agent] ok in ${Date.now() - t0}ms`);
        return res;
      } catch (e) {
        last = e;
        console.error(`[agent] FAILED after ${Date.now() - t0}ms model=${model}:`, (e as Error).message);
        if (/404|NOT_FOUND/i.test((e as Error).message)) break; // model retired/unknown: try the next one
        if (!isTransient(e) && !/abort|timeout|timed out|fetch failed/i.test((e as Error).message)) throw e;
        if (/429|RESOURCE_EXHAUSTED|504|DEADLINE_EXCEEDED/i.test((e as Error).message)) break; // quota or too slow: go straight to the next model
        await sleep(800 * 2 ** attempt);
      }
    }
  }
  throw last;
}

export type Step = { tool: string; args: unknown; result: unknown };
export async function runAgent(message: string, history: { role: 'user' | 'model'; text: string }[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const contents: Content[] = [...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })), { role: 'user', parts: [{ text: message }] }];
  const steps: Step[] = [];
  for (let round = 0; round < 5; round++) { // max 5 rounds between Gemini and the tools
    const res = await generateWithRetry(ai, contents);
    const calls = res.functionCalls ?? [];
    if (!calls.length) return { reply: res.text ?? 'Sorry, I could not produce an answer.', steps };
    contents.push(res.candidates![0].content!);
    const parts = [];
    for (const c of calls) {
      const result = await runTool(c.name ?? '', c.args);
      steps.push({ tool: c.name ?? '', args: c.args, result });
      parts.push({ functionResponse: { name: c.name, response: { output: result } } });
    }
    contents.push({ role: 'user', parts });
  }
  return { reply: 'I reached the 5-step limit. Please try a narrower request.', steps };
}
