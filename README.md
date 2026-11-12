# StockPilot: Inventory Restock Agent
Team <number> | PS2 | SRM Agentic AI Hackathon

## The problem
A supermarket store manager loses sales because items run out. Nobody checks stock against reorder levels in time, and purchase orders are made by hand in a spreadsheet.

## What our app does
- Dashboard with low-stock count, restock cost, stock value and open purchase orders
- Products page with stock, reorder level, days of stock left and status
- Agent chat: the manager asks in plain English, and Gemini picks tools to read stock and create draft purchase orders
- Draft purchase orders are created **one per supplier**, ordering `reorder_qty` for each item that is low (`stock_qty <= reorder_level`)
- Purchase Orders page to approve or cancel drafts. The chat shows which tools the agent called and with what data

## Live demo
- Vercel link: https://stockpilot-taupe-chi.vercel.app/
- Passcode: <passcode>
- Try this prompt: "Create purchase orders for all low-stock dairy items."

## Agent tools (Gemini function calling, max 5 rounds, args validated with Zod)
| Tool | What it does | Reads or writes |
| --- | --- | --- |
| getLowStockItems | Items at or below reorder level, optional category | Reads |
| getSupplierDetails | Supplier contact, lead time, low-stock count | Reads |
| estimateDaysOfStockLeft | Items that run out within N days at current sales | Reads |
| createPurchaseOrder | Draft PO per supplier for low items (skips items already on an open PO) | Writes |
| updateStock | Sets stock quantity, e.g. after a delivery | Writes |

## Database tables
- `suppliers`: name, contact email, lead time
- `products`: sku, category, supplier, unit cost, `stock_qty`, `reorder_level`, `reorder_qty`, `avg_daily_sales`
- `purchase_orders`: supplier, status (draft/approved/cancelled), total cost
- `purchase_order_items`: PO, product, qty, unit cost

## Tech stack
Next.js, React, TypeScript, Tailwind CSS, Supabase, Gemini API (function calling), Zod, Vercel

## Team (4 members)
| Name | Role | Owns |
| --- | --- | --- |
| <name> | Team Lead + Database | README.md, Vercel, `seed/`, `lib/supabase.ts`, `lib/inventory.ts` |
| <name> | Frontend | `app/**/page.tsx`, `app/layout.tsx`, `components/`, `globals.css`, `tailwind.config.ts` |
| <name> | Backend / API | `app/api/**`, `middleware.ts`, `lib/schemas.ts` |
| <name> | AI / Agent | `lib/agent/index.ts` (prompt, loop), `lib/agent/tools.ts` |

## Run it locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the 5 keys
3. In the Supabase SQL Editor run `seed/00_starter_example.sql` (from the starter), then `seed/ps2_inventory_restock.sql`
4. `npm run dev`, open http://localhost:3000, enter your passcode. Check `/api/health` if anything fails.
5. Before pushing: `npm run build`
