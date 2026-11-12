# Work split (4 people, per the guide: Team Lead also owns Database)
Everyone commits to the repo, writes code and must explain any part when judges ask.

| Time | Team Lead + DB | Frontend | Backend / API | AI / Agent |
| --- | --- | --- | --- | --- |
| 10:15-10:45 | Create repo, add members, Supabase project, run seed SQL, copy keys, deploy to Vercel | Clone, `npm install`, run app | Clone, check `/api/health` | Create Gemini key, test a prompt |
| 10:45-12:30 | Verify tables/seed; edit `lib/inventory.ts`; write README tool table | Dashboard + Products pages | Zod schemas, `/api/products`, `/api/dashboard`, passcode | Write `tools.ts`: 3 read tools, then `createPurchaseOrder` |
| 12:30 | **Checkpoint:** one Gemini tool works end to end | | | |
| 1:30-2:45 | Seed edge cases (all healthy, already on order); test PO rules | Agent chat UI, tool-steps panel, PO page, mobile layout | `/api/agent`, `/api/purchase-orders` (approve/cancel), error messages | `updateStock`, tune system prompt, test unclear prompts |
| 2:45-3:30 | README, 5 slides, Vercel env vars | Polish UI, empty states | Test bad input (422 paths) | Rehearse demo prompts |
| 3:30 | **Code freeze.** Check no keys in repo, Vercel link live, submit form | | | |

Demo (about 3 min): business user and problem in one line, then "Create purchase orders for all low-stock dairy items." The agent calls 2 or more tools, and the new draft PO appears under Purchase Orders. Finish with "What do I need to reorder?", then a vague request like "do the thing" to show it asks for clarification.
