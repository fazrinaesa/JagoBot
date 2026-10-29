-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- pgvector dibutuhkan kolom embedding (Unsupported("vector")).
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nama_toko" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama_lengkap" TEXT,
    "whatsapp" TEXT,
    "alamat" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bot" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nama_bot" TEXT NOT NULL,
    "personality" TEXT NOT NULL DEFAULT 'Ramah',
    "whatsapp_linked" BOOLEAN NOT NULL DEFAULT false,
    "instructions" TEXT,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBase" (
    "id" SERIAL NOT NULL,
    "botId" INTEGER NOT NULL,
    "nama_sumber" TEXT NOT NULL,
    "file_path" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isi_teks" TEXT,
    "tipe_sumber" TEXT DEFAULT 'file',

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" SERIAL NOT NULL,
    "knowledgeBaseId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatLog" (
    "id" SERIAL NOT NULL,
    "botId" INTEGER NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "response_time_ms" INTEGER,
    "tokenCount" INTEGER,

    CONSTRAINT "ChatLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "dailyTokenQuota" INTEGER NOT NULL DEFAULT 5000,
    "tokensUsedToday" INTEGER NOT NULL DEFAULT 0,
    "lastQuotaReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentProof" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subscriptionId" INTEGER,
    "amount" INTEGER NOT NULL,
    "proofUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleSheetsConnection" (
    "id" SERIAL NOT NULL,
    "botId" INTEGER NOT NULL,
    "spreadsheetId" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL DEFAULT 'Sheet1',
    "pollIntervalMin" INTEGER NOT NULL DEFAULT 60,
    "lastSyncedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "oauthToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleSheetsConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProviderConfig" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openai-compatible',
    "baseUrl" TEXT,
    "apiKeyEnc" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxTokens" INTEGER,
    "temperature" DOUBLE PRECISION,
    "lastStatus" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsageLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "botId" INTEGER,
    "apiKeyId" INTEGER,
    "endpoint" TEXT NOT NULL,
    "model" TEXT,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "statusCode" INTEGER,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramConnection" (
    "id" SERIAL NOT NULL,
    "botId" INTEGER NOT NULL,
    "botTokenEnc" TEXT NOT NULL,
    "webhookSecretEnc" TEXT NOT NULL,
    "telegramBotId" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "lastUpdateId" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'connected',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramUpdate" (
    "id" SERIAL NOT NULL,
    "connectionId" INTEGER NOT NULL,
    "updateId" BIGINT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBase_botId_nama_sumber_key" ON "KnowledgeBase"("botId", "nama_sumber");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramConnection_botId_key" ON "TelegramConnection"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUpdate_connectionId_updateId_key" ON "TelegramUpdate"("connectionId", "updateId");

-- AddForeignKey
ALTER TABLE "Bot" ADD CONSTRAINT "Bot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "KnowledgeBase"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChatLog" ADD CONSTRAINT "ChatLog_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleSheetsConnection" ADD CONSTRAINT "GoogleSheetsConnection_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiUsageLog" ADD CONSTRAINT "ApiUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramConnection" ADD CONSTRAINT "TelegramConnection_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
