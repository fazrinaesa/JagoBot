-- Additive Telegram connection storage; existing rows/tables remain untouched.
CREATE TABLE IF NOT EXISTS "TelegramConnection" (
  "id" SERIAL PRIMARY KEY,
  "botId" INTEGER NOT NULL UNIQUE REFERENCES "Bot"("id") ON DELETE CASCADE,
  "botTokenEnc" TEXT NOT NULL,
  "webhookSecretEnc" TEXT NOT NULL,
  "telegramBotId" TEXT NOT NULL,
  "telegramUsername" TEXT,
  "lastUpdateId" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'connected',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "TelegramConnection_status_idx" ON "TelegramConnection"("status");
-- Applied to the local development database after verifying a pre-migration backup.
-- Apply to deployment databases only after taking a verified backup.
