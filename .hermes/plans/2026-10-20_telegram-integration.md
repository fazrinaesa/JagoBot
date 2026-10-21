# Telegram Integration (MVP private text chat)

## Findings
- `src/pages/IntegrationSettings.tsx`: Telegram card is disabled “Segera Hadir”; no API integration.
- `jagobot-backend/src/controllers/integrasiController.ts`: existing widget handler has bot lookup, RAG/context, `generateChatCompletion`, ChatLog, token usage logging.
- `jagobot-backend/prisma/schema.prisma`: Bot belongs to User; ChatLog has platform/message/response but no stable channel identity or update dedupe; Subscription stores plan/status/quota.
- `jagobot-backend/src/lib/cryptoKey.ts`: `encryptKey`/`decryptKey` use `AI_CONFIG_SECRET` (fallback JWT secret); reuse, never expose raw token.
- `jagobot-backend/src/routes/integrasiRoutes.ts`: unauthenticated public chat route has subscription/quota middleware. `server.ts` mounts `/api/public`.
- Public HTTPS webhook URL not confirmed. Integration must stay dormant until `TELEGRAM_WEBHOOK_BASE_URL` is configured.

## Scope
- One Telegram bot connection per JagoBot Bot.
- Private text messages only. Defer groups, media, channel posts, multiple Telegram bot accounts per JagoBot bot.
- Authenticated connect/status/disconnect endpoints; validate token via `getMe`; encrypted at rest; masked status only.
- Telegram webhook path under `/api/telegram/webhook/:connectionId`, secret-token verification, update deduplication, active Telegram entitlement + quota checks, current RAG/LLM pipeline, ChatLog platform=`telegram`, API/token metering, `sendMessage` response.
- Dashboard connect form/status/disconnect.

## Additive data model
- New `TelegramConnection`: `id`, unique `botId`, `botTokenEnc`, `webhookSecret`, `telegramBotId`, `telegramUsername`, `lastUpdateId`, `status`, timestamps; relation Bot with cascade.
- SQL migration is CREATE TABLE only; preserve all existing tables/data.

## API
- `POST /api/telegram/connections` (JWT): `{botId, token}`; prove bot ownership and active telegram/combined plan, validate token, encrypt, register webhook only if public HTTPS env configured.
- `GET /api/telegram/connections/:botId` (JWT): ownership check; return status/username, never secrets.
- `DELETE /api/telegram/connections/:botId` (JWT): remove webhook remotely best-effort, delete credentials.
- `POST /api/telegram/webhook/:connectionId` (public provider callback): verify Telegram secret header, validate/dedupe update, process supported private text, apply owner subscription/plan/quota, call AI, persist, reply.

## Delivery phases
1. Add model + SQL migration, regenerate Prisma, implement authenticated connection lifecycle and safe encryption.
2. Implement webhook registration, verification, dedupe, private-text path via AI, persistence, quota and outbound replies.
3. Replace Telegram coming-soon card with token/status UI; preserve other channel/widget UX.
4. Validate schema, typecheck backend, build frontend, diff check; run local tests with mocked Telegram API. Real webhook E2E requires deployment URL and user-owned Telegram bot token.

## Safety / defaults
- New subsystem remains dormant when `TELEGRAM_WEBHOOK_BASE_URL` is unset; do not register remote webhook until HTTPS URL is configured.
- Never log or return token/secret. No real token may be generated or tested without user-provided credential.
- Backend subscription gate is authoritative. Basic/Web Widget plan cannot connect Telegram.
- Existing Web Widget path remains unchanged.
- No commit unless explicitly requested.

## Definition of Done
- Additive migration validated and Prisma client generated.
- Invalid token rejected; unauthorized user cannot connect another user's bot; inactive/non-Telegram subscription rejected.
- Webhook secret mismatch/duplicate update rejected; valid private text produces one reply/log; unsupported updates ignored safely.
- Frontend build and backend project typecheck pass; diff check clean.
- Real live bot/webhook verification clearly marked blocked until HTTPS URL + bot token available.

STATUS: Implementation underway; deployment URL not confirmed.