# JagoBot Next Phase — Execution Plan

> **For Hermes:** implement task-by-task on branch `darren`. Do NOT commit without user permission.

**Goal:** Finish the next-phase roadmap (9router swap, payments, Sheets, Hermes Agent pilot, self-host deploy) from the partially-implemented state currently sitting uncommitted on `darren`.

**Architecture:** Existing Express + Prisma/pgvector + React/Vite stack stays. Add: unified LLM layer (done), quota-metered subscriptions (done), Google Sheets read/write, one Hermes Agent process per bot calling back into the existing RAG via HTTP tool, Docker Compose + Cloudflare Tunnel for self-hosting.

**Tech Stack:** Node/Express 5, Prisma 6 + Supabase pgvector, OpenAI SDK v7 (→9router), googleapis, React 19 + Vite, Docker Compose, Cloudflare Tunnel.

---

## 0. Actual current state (audited 2026-08-10, branch `darren`)

Roadmap section → reality on disk:

| Plan section | Status | Evidence |
|---|---|---|
| 1. 9router swap | **~90% done** | `jagobot-backend/src/lib/llm.ts` exists: 9router primary + Gemini fallback, `generateChatCompletion` / `generateEmbedding` / `llmHealthCheck`. `lib/gemini.ts` now orphaned (zero importers). |
| 2. Hermes Agent | **0%** | No orchestration code, no WhatsApp/Telegram anywhere in `jagobot-backend/src/`. |
| 3. Payment dashboard | **~95% done** | `paymentController.ts`, `paymentRoutes.ts` (7 routes) mounted at `/api/payment`, `quotaMiddleware.ts` wired into `chatRoutes`, `Subscription`/`PaymentProof` models in schema, `PaymentPage.tsx` + `AdminPaymentPage.tsx` routed in `App.tsx`. |
| 4. Spreadsheet | **~70% written, 0% wired** | `lib/googleSheets.ts`, `sheetsController.ts`, `sheetsRoutes.ts` exist — but **`sheetsRoutes` is NOT mounted in `server.ts`** and the file has 3 TypeScript errors. No frontend page. |
| 5. Self-host deploy | **~50%** | `Dockerfile`, `jagobot-backend/Dockerfile`, `docker-compose.yml`, `nginx.conf`, `.dockerignore`, `DEPLOYMENT_GUIDE.md` exist. No Cloudflare Tunnel, no backup/monitoring. |
| 6. Company registration | N/A | Business task, not code. |

**Blocking build errors** (`cd jagobot-backend && npx tsc --noEmit`):
```
src/lib/googleSheets.ts(7,22)   TS7016  no @types/crypto-js
src/lib/googleSheets.ts(167,21) TS2353  'embedding' not assignable in DocumentChunkCreateInput
src/lib/googleSheets.ts(207,21) TS2353  'embedding' not assignable in DocumentChunkCreateInput
```
Cause of TS2353: `DocumentChunk.embedding` is `Unsupported("vector")?` — Prisma Client cannot write it via `create()`. The rest of the codebase must already write vectors via raw SQL; `googleSheets.ts` didn't get the memo.

**Unanswered open questions that gate work** (ask the team before the relevant phase):
- 9router `/embeddings` endpoint + model + vector dimension → gates Phase 1 verification.
- Sheets = Google Sheets? (assumed yes, code already uses `googleapis`) → gates Phase 2.
- Telegram add-on billing period → gates nothing in code, only pricing copy.
- Hermes gateway target platforms (WA + Telegram + Discord or subset) → gates Phase 4.

---

## Phase 1 — Make the tree build and prove the LLM layer (do first, blocks everything)

### Task 1.1: Install missing types
**Files:** Modify `jagobot-backend/package.json`

```bash
cd "D:/1. ASET JAGOAI/2. VIBE CODED/JagoBot/jagobot-backend"
npm i -D @types/crypto-js
```
Verify: `npx tsc --noEmit` — the TS7016 error is gone, 2 TS2353 remain.

### Task 1.2: Fix vector writes in googleSheets.ts
**Files:** Modify `jagobot-backend/src/lib/googleSheets.ts:167`, `:207`

First read how the existing working path does it:
```bash
grep -rn "embedding" jagobot-backend/src/controllers/knowledgeController.ts
```
Copy that exact pattern (expected: `prisma.$executeRaw` with `::vector` cast). Replace both `prisma.documentChunk.create({ data: { ..., embedding } })` calls with the raw-SQL insert form, e.g.:
```ts
await prisma.$executeRaw`
  INSERT INTO "DocumentChunk" ("knowledgeBaseId", "content", "embedding")
  VALUES (${knowledgeBaseId}, ${content}, ${`[${embedding.join(',')}]`}::vector)
`;
```
Verify: `npx tsc --noEmit` → **0 errors**. This is the gate for every later task.

### Task 1.3: Delete the orphaned Gemini module
**Files:** Delete `jagobot-backend/src/lib/gemini.ts`

`grep -rn "lib/gemini" jagobot-backend/src/` returns nothing — it is dead code. Keep `@google/generative-ai` in package.json (llm.ts still uses it as fallback).
Verify: `npx tsc --noEmit` → 0 errors.

### Task 1.4: Add env vars and an LLM health endpoint
**Files:** Modify `jagobot-backend/.env`, `jagobot-backend/server.ts:44`

Add to `.env` (values from the team — do not invent keys):
```
NINEROUTER_BASE_URL=
NINEROUTER_API_KEY=
NINEROUTER_CHAT_MODEL=
NINEROUTER_EMBED_MODEL=
```
`llm.ts` already exports `llmHealthCheck()`. Expose it:
```ts
import { llmHealthCheck } from './src/lib/llm';
app.get('/api/health/llm', async (_req, res) => res.json(await llmHealthCheck()));
```
Verify (this is the answer to the open embeddings question — measure, don't ask):
```bash
npm run dev
curl -s localhost:3001/api/health/llm
```
Expected: `{"chat":"ok","embedding":"ok"}`. If `embedding` reports an error, 9router has no `/embeddings` endpoint → keep Gemini as the embedding provider permanently and record that decision here. **Do not switch embedding models unless you also regenerate every `DocumentChunk.embedding` row** — old and new vectors are incompatible inside `match_document_chunks()`.

### Task 1.5: Log the embedding dimension
**Files:** none (read-only check)
```sql
SELECT vector_dims(embedding) AS dims, count(*) FROM "DocumentChunk" GROUP BY 1;
```
Expected: a single row. More than one row = corrupted mixed-dimension knowledge base; stop and report before continuing.

**Commit gate:** ask the user, then `git commit -m "fix: build errors, remove dead gemini module, add llm health endpoint"`.

---

## Phase 2 — Finish Spreadsheet integration (nearest to done, unblocks nothing else)

### Task 2.1: Mount the sheets routes
**Files:** Modify `jagobot-backend/server.ts:43`
```ts
import sheetsRoutes from './src/routes/sheetsRoutes';
app.use('/api/sheets', sheetsRoutes);
```
Verify: `curl -s localhost:3001/api/sheets/connection` → 401 (not 404). 404 means it's still unmounted.

### Task 2.2: Google OAuth credentials
**Files:** Modify `jagobot-backend/.env`
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/api/sheets/callback
SHEETS_ENCRYPTION_KEY=
```
Scope must be `https://www.googleapis.com/auth/spreadsheets` only — never full Drive. Confirm the scope string in `lib/googleSheets.ts` matches before testing.

### Task 2.3: End-to-end read test (API-first, no UI yet)
```bash
TOKEN=$(curl -s -X POST localhost:3001/api/auth/login -H 'Content-Type: application/json' -d '{"email":"...","password":"..."}' | jq -r .token)
curl -s -X POST localhost:3001/api/sheets/auth-url -H "Authorization: Bearer $TOKEN"   # open URL, consent
curl -s -X POST localhost:3001/api/sheets/save -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"botId":1,"spreadsheetId":"<id>","sheetName":"Sheet1"}'
curl -s -X POST localhost:3001/api/sheets/sync -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"botId":1}'
```
Then verify in DB: `SELECT count(*) FROM "DocumentChunk" WHERE "knowledgeBaseId" = <the sheet's kb id>;` → > 0.
Only after all four curls pass do you touch frontend code.

### Task 2.4: Polling scheduler
**Files:** Create `jagobot-backend/src/lib/sheetsPoller.ts`, modify `server.ts`

MVP = one `setInterval` in-process, no cron dependency:
```ts
// ponytail: single-process setInterval. Ceiling: breaks with >1 backend replica
// (duplicate syncs). Upgrade to a DB advisory lock or external cron when we scale out.
setInterval(async () => {
  const due = await prisma.googleSheetsConnection.findMany({ where: { isActive: true } });
  for (const c of due) {
    if (!c.lastSyncedAt || Date.now() - +c.lastSyncedAt > c.pollIntervalMin * 60_000) {
      await syncConnection(c.id).catch(e => console.error('[sheets] sync failed', c.id, e));
    }
  }
}, 5 * 60_000);
```
Verify: set `pollIntervalMin=1` on a test row, watch the log for two syncs in ~10 min.

### Task 2.5: Frontend connect UI
**Files:** Create `src/pages/SheetsIntegration.tsx`; modify `src/App.tsx` (route `/dashboard/sheets`), `src/lib/api.ts`, `src/components/DashboardLayout.tsx` (nav link)

Minimum viable: connect button → auth URL redirect; spreadsheet ID + sheet name inputs; "Sync now" button; last-synced timestamp; disconnect. No preview grid, no column mapper.
→ skipped: live preview, column mapping. Add when a client actually asks.

**Commit gate:** ask, then `git commit -m "feat: wire google sheets read integration + polling"`.

---

## Phase 3 — Payments: verify, don't rebuild

Code is written; nobody has proven it runs. Test before touching anything.

### Task 3.1: Prove the schema is migrated
```bash
cd jagobot-backend && npx prisma migrate status
```
If `Subscription` / `PaymentProof` / `GoogleSheetsConnection` are not in the DB: `npx prisma migrate dev --name payment_sheets_quota`.
Verify: `\d "Subscription"` in psql shows `dailyTokenQuota`, `tokensUsedToday`, `lastQuotaReset`.

### Task 3.2: Exercise every payment endpoint with curl
In order, recording actual responses:
```
GET  /api/payment/subscription
GET  /api/payment/quota
POST /api/payment/submit           (multipart, proof image)
GET  /api/payment/admin/proofs     (admin token)
POST /api/payment/admin/review     ({proofId, action:"approve"})
GET  /api/payment/subscription     (must now show status "active" + endDate)
```
Any non-2xx = fix that endpoint before moving on.

### Task 3.3: Prove quota enforcement actually blocks
1. `UPDATE "Subscription" SET "dailyTokenQuota"=10, "tokensUsedToday"=0 WHERE "userId"=<id>;`
2. Send 2–3 chat messages via `POST /api/chat/...`.
3. Expected: the request after the quota is exceeded returns **429** with a clear Indonesian message, not a 500 and not a silent success.
4. Confirm `tokensUsedToday` incremented in the DB.

### Task 3.4: Daily reset check
`lastQuotaReset` must roll `tokensUsedToday` back to 0 on a new day. Test by setting `lastQuotaReset` to 2 days ago and re-checking `GET /api/payment/quota` → expect 0 used.

### Task 3.5: Encode the real price list
**Files:** Create `jagobot-backend/src/config/pricing.ts`; modify `PaymentPage.tsx`

Single source of truth, one object, no admin CRUD UI:
```ts
export const PRICING = {
  setup:            { label: 'Setup (sekali bayar)', amount: 349_000 },
  whatsappMonthly:  { label: 'WhatsApp / bulan',     amount: 139_000 },
  whatsappYearly:   { label: 'WhatsApp / tahun',     amount: 1_390_000 },
  telegram:         { label: 'Telegram',             amount: 95_999 }, // TODO period unconfirmed
} as const;
```
→ skipped: DB-backed pricing table, admin price editor. Add when prices change more than twice a year.

**Commit gate:** ask before committing.

---

## Phase 4 — Hermes Agent pilot (ONE bot, no orchestration layer)

The roadmap explicitly says: pilot one bot end-to-end before building multi-tenant orchestration. Resist building the orchestrator in this phase.

### Task 4.1: Expose RAG as an HTTP tool endpoint
**Files:** Create `jagobot-backend/src/routes/agentToolRoutes.ts`; modify `server.ts`

One endpoint, shared-secret auth (not JWT — this is machine-to-machine):
```
POST /api/agent/knowledge-search   { botId, query, topK? }  →  { chunks: [{content, score}] }
Header: X-Agent-Secret: $AGENT_SHARED_SECRET
```
Reuse the existing retrieval function from `chatController.ts` — do not duplicate the embedding + `match_document_chunks()` logic.
Verify: `curl -s -X POST localhost:3001/api/agent/knowledge-search -H "X-Agent-Secret: $S" -H 'Content-Type: application/json' -d '{"botId":1,"query":"harga"}'` returns real chunks from the bot's knowledge base.

### Task 4.2: Order-logging tool endpoint (Sheets write side)
**Files:** add to `agentToolRoutes.ts` + `lib/googleSheets.ts`
```
POST /api/agent/log-order  { botId, customer_name, product, qty, notes }  →  { ok: true, row: N }
```
Appends one row via `sheets.spreadsheets.values.append`. Buffer writes in memory and flush every ~10s or 20 rows to respect Sheets quota.
Verify: 3 curls → 3 new rows visible in the actual spreadsheet.

### Task 4.3: Stand up one Hermes Agent instance
**Files:** Create `hermes-bots/pilot/config.yaml`, `hermes-bots/pilot/skills/jagobot-knowledge/SKILL.md`

- Install Hermes Agent, configure the messaging gateway for **Telegram first** (official API, free, zero ban risk — prove the loop on the safe channel).
- Register the two endpoints from 4.1/4.2 as tools the agent calls.
- Enable the target skill set: conversational chat, vision, data analysis.
- Verify: message the Telegram bot a question whose answer only exists in the knowledge base → correct answer. Send a product photo → agent describes it. Say "catat pesanan 2 kaos merah" → new row appears in the sheet.

### Task 4.4: WhatsApp channel + risk mitigations (only after Telegram works)
- Unofficial automation on a regular number, per the confirmed decision.
- **Required before any customer traffic:**
  - Randomized reply delay (2–6s), no bulk/broadcast sends.
  - Plain-language risk disclosure in the customer agreement — WhatsApp channel may be disrupted; Telegram is the guaranteed channel.
  - Per-number send-rate cap.
- Reality check to keep in the room: one stable personal bot ≠ dozens of identically-fingerprinted customer numbers. Treat the reference deployment's uptime as reassuring, not as proof.

### Task 4.5: Evaluate before scaling
Write a short go/no-go note in this repo after ~1 week of pilot traffic: answer quality, WhatsApp stability, token cost per conversation. **Multi-tenant orchestration is out of scope for this plan** — it gets its own plan once the pilot data exists.

---

## Phase 5 — Self-hosted deployment

### Task 5.1: Audit the existing Docker setup
```bash
docker compose config      # validates docker-compose.yml
docker compose build
docker compose up -d
curl -s localhost/api/health
```
Fix whatever fails. Confirm `restart: unless-stopped` is set on every service.

### Task 5.2: Cloudflare Tunnel instead of port-forwarding
Add a `cloudflared` service to `docker-compose.yml` with a token from env. No inbound router ports, automatic HTTPS at the edge, warehouse IP never exposed.
Verify: the public hostname serves the app from outside the warehouse network, and the router still has zero forwarded ports.

### Task 5.3: Keep Postgres on Supabase
Do not move the DB in the same migration as everything else. NAS holds uploaded PDFs/DOCX and nightly `pg_dump` output — **never** the live Postgres data directory.

### Task 5.4: Backups with a proven restore
Nightly `pg_dump` to the NAS + file snapshot. Then actually restore one dump into a scratch database and confirm row counts match. An untested backup is not a backup.

### Task 5.5: Monitoring + hardening
Uptime Kuma container pointed at `/api/health`, `/api/health/llm`, and the Telegram bot. Firewall to needed ports only, fail2ban, NAS admin panel off the public network entirely. UPS on the server.

---

## Files likely to change

```
jagobot-backend/server.ts                        mount sheets + agent routes, llm health
jagobot-backend/src/lib/googleSheets.ts          fix vector writes, add append/write buffer
jagobot-backend/src/lib/gemini.ts                DELETE (dead)
jagobot-backend/src/lib/sheetsPoller.ts          NEW
jagobot-backend/src/routes/agentToolRoutes.ts    NEW
jagobot-backend/src/config/pricing.ts            NEW
jagobot-backend/.env                             9router, Google OAuth, agent secret
jagobot-backend/package.json                     @types/crypto-js
src/pages/SheetsIntegration.tsx                  NEW
src/App.tsx, src/lib/api.ts, src/components/DashboardLayout.tsx
docker-compose.yml                               cloudflared service
hermes-bots/pilot/                               NEW (agent config + tools)
```

## Risks / tradeoffs

- **Embedding dimension mismatch is the single most destructive failure mode.** If 9router's embedding model differs from Gemini's, every existing `DocumentChunk.embedding` row is silently wrong and search quality degrades without an error. Task 1.5 exists to catch this early.
- **The uncommitted work on `darren` is untested code.** It was written but never run — treat Phases 2 and 3 as verification passes, not as "already done".
- **In-process Sheets polling** breaks if the backend runs more than one replica. Marked with a `ponytail:` comment and an upgrade path.
- **WhatsApp unofficial automation at platform scale** is the biggest business risk in this plan and is not solvable with code — mitigations are contractual + behavioural.

## Open questions to resolve with the team

1. 9router `/embeddings`: available? which model? what dimension? (Task 1.4 answers this empirically — do that before asking.)
2. Telegram add-on Rp95,999 — monthly or annual?
3. Does Sheets integration become a standard offering, or stay scoped to this one client?
4. Hermes gateway platforms for the pilot — Telegram-only is recommended for Phase 4.1–4.3.
5. Supabase stays as the DB after self-hosting? (Recommended: yes.)
