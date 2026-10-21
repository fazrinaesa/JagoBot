import { Request, Response } from 'express';
import * as crypto from 'crypto';
import prisma from '../lib/prisma';
import CryptoJS from 'crypto-js';
const telegramEncryptionSecret = () => {
  const secret = process.env.AI_CONFIG_SECRET || (process.env.JWT_SECRET !== 'jagobot-fallback-secret' ? process.env.JWT_SECRET : '');
  return secret && secret.length >= 32 ? secret : '';
};
const encryptTelegramSecret = (value: string) => CryptoJS.AES.encrypt(value, telegramEncryptionSecret()).toString();
const decryptTelegramSecret = (value: string) => CryptoJS.AES.decrypt(value, telegramEncryptionSecret()).toString(CryptoJS.enc.Utf8);
import { generateChatCompletion } from '../lib/llm';
import { estimateTokens, logApiUsage } from '../lib/usageLog';

const api = (token: string, method: string) => `https://api.telegram.org/bot${token}/${method}`;
const webhookBase = () => process.env.TELEGRAM_WEBHOOK_BASE_URL?.replace(/\/$/, '');
const webhookUrl = (id: number) => `${webhookBase()}/api/telegram/webhook/${id}`;
const makeSecret = () => crypto.randomBytes(32).toString('hex');

async function telegramCall(token: string, method: string, body?: unknown) {
  const response = await fetch(api(token, method), {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json() as { ok?: boolean; result?: any; description?: string };
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram API ${method} failed`);
  return data.result;
}

async function requireTelegramPlan(userId: number) {
  const now = new Date();
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      planType: { in: ['telegram', 'whatsapp+telegram'] },
      OR: [{ endDate: null }, { endDate: { gt: now } }],
    },
    orderBy: { endDate: 'desc' },
  });
}

export const getTelegramConnection = async (req: Request, res: Response) => {
  const userId = Number((req as any).user?.userId || (req as any).user?.id);
  const botId = Number(req.params.botId);
  if (!Number.isInteger(botId) || botId <= 0) return res.status(400).json({ message: 'botId tidak valid.' });
  const bot = await prisma.bot.findFirst({ where: { id: botId, userId }, select: { id: true } });
  if (!bot) return res.status(404).json({ message: 'Bot tidak ditemukan atau bukan milik akun Anda.' });
  const connection = await prisma.telegramConnection.findUnique({ where: { botId } });
  return res.json({ data: connection ? { connected: connection.status === 'connected', username: connection.telegramUsername, status: connection.status } : { connected: false, username: null, status: 'disconnected' } });
};

export const connectTelegram = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user?.userId || (req as any).user?.id);
    const botId = Number(req.body?.botId);
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    if (!Number.isInteger(botId) || botId <= 0 || !token || token.length > 200) return res.status(400).json({ message: 'botId dan token Telegram valid wajib diisi.' });
    const bot = await prisma.bot.findFirst({ where: { id: botId, userId }, select: { id: true, userId: true } });
    if (!bot) return res.status(404).json({ message: 'Bot tidak ditemukan atau bukan milik akun Anda.' });
    if (!(await requireTelegramPlan(userId))) return res.status(402).json({ status: 'subscription_required', message: 'Paket Telegram aktif diperlukan untuk menghubungkan bot.' });
    const base = webhookBase();
    if (!base || !/^https:\/\//i.test(base)) return res.status(503).json({ message: 'Webhook belum siap. Atur TELEGRAM_WEBHOOK_BASE_URL ke backend publik HTTPS.' });
    if (!telegramEncryptionSecret()) return res.status(503).json({ message: 'Atur AI_CONFIG_SECRET atau JWT_SECRET kuat sebelum menyimpan token Telegram.' });
    const me = await telegramCall(token, 'getMe');
    if (!me?.id || !me?.is_bot) return res.status(400).json({ message: 'Token tidak valid untuk bot Telegram.' });
    const webhookSecret = makeSecret();
    const existing = await prisma.telegramConnection.findUnique({ where: { botId } });
    const saved = await prisma.telegramConnection.upsert({
      where: { botId },
      create: { botId, botTokenEnc: encryptTelegramSecret(token), webhookSecretEnc: encryptTelegramSecret(webhookSecret), telegramBotId: String(me.id), telegramUsername: me.username || null, status: 'pending' },
      update: { botTokenEnc: encryptTelegramSecret(token), webhookSecretEnc: encryptTelegramSecret(webhookSecret), telegramBotId: String(me.id), telegramUsername: me.username || null, status: 'pending', lastUpdateId: 0 },
    });
    try {
      await telegramCall(token, 'setWebhook', { url: webhookUrl(saved.id), secret_token: webhookSecret, allowed_updates: ['message'], drop_pending_updates: false });
      await prisma.telegramConnection.update({ where: { id: saved.id }, data: { status: 'connected' } });
      if (existing?.botTokenEnc) {
        const oldToken = decryptTelegramSecret(existing.botTokenEnc);
        if (oldToken && oldToken !== token) {
          try { await telegramCall(oldToken, 'deleteWebhook', { drop_pending_updates: false }); } catch { /* old token may be revoked */ }
        }
      }
      return res.json({ message: 'Bot Telegram terhubung.', data: { connected: true, username: me.username || null } });
    } catch (error) {
      if (existing) {
        await prisma.telegramConnection.update({ where: { id: saved.id }, data: { botTokenEnc: existing.botTokenEnc, webhookSecretEnc: existing.webhookSecretEnc, telegramBotId: existing.telegramBotId, telegramUsername: existing.telegramUsername, lastUpdateId: existing.lastUpdateId, status: existing.status } });
        try { await telegramCall(decryptTelegramSecret(existing.botTokenEnc), 'setWebhook', { url: webhookUrl(saved.id), secret_token: decryptTelegramSecret(existing.webhookSecretEnc), allowed_updates: ['message'], drop_pending_updates: false }); } catch { /* restored data remains; manual webhook repair may be needed */ }
      } else {
        await prisma.telegramConnection.delete({ where: { id: saved.id } });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('[Telegram] Connect failed:', error.message);
    return res.status(400).json({ message: 'Gagal menghubungkan bot Telegram. Periksa token dan konfigurasi webhook.' });
  }
};

export const disconnectTelegram = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user?.userId || (req as any).user?.id);
    const botId = Number(req.params.botId);
    const bot = await prisma.bot.findFirst({ where: { id: botId, userId }, select: { id: true } });
    if (!bot) return res.status(404).json({ message: 'Bot tidak ditemukan atau bukan milik akun Anda.' });
    const connection = await prisma.telegramConnection.findUnique({ where: { botId } });
    if (!connection) return res.json({ message: 'Bot sudah terputus.' });
    try { await telegramCall(decryptTelegramSecret(connection.botTokenEnc), 'deleteWebhook', { drop_pending_updates: false }); } catch (error: any) { console.warn('[Telegram] deleteWebhook failed:', error.message); }
    await prisma.telegramConnection.delete({ where: { botId } });
    return res.json({ message: 'Bot Telegram terputus.' });
  } catch (error) {
    console.error('[Telegram] Disconnect failed:', error);
    return res.status(500).json({ message: 'Gagal memutuskan bot Telegram.' });
  }
};

export const handleTelegramWebhook = async (req: Request, res: Response) => {
  const connectionId = Number(req.params.connectionId);
  const connection = await prisma.telegramConnection.findUnique({ where: { id: connectionId }, include: { bot: true } });
  if (!connection || connection.status !== 'connected') return res.sendStatus(404);
  const supplied = req.header('x-telegram-bot-api-secret-token') || '';
  const secret = decryptTelegramSecret(connection.webhookSecretEnc);
  if (!secret || supplied.length !== secret.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))) return res.sendStatus(403);
  const updateId = Number(req.body?.update_id);
  if (!Number.isSafeInteger(updateId) || updateId < 0) return res.sendStatus(200);
  const advanced = await prisma.telegramConnection.updateMany({ where: { id: connection.id, lastUpdateId: { lt: updateId } }, data: { lastUpdateId: updateId } });
  if (!advanced.count) return res.sendStatus(200);
  const message = req.body?.message;
  if (!message?.text || message.chat?.type !== 'private' || message.from?.is_bot) return res.sendStatus(200);
  try {
    const sub = await requireTelegramPlan(connection.bot.userId);
    if (!sub) return res.sendStatus(200);
    const current = await prisma.subscription.findUnique({ where: { id: sub.id } });
    if (!current) return res.sendStatus(200);
    const now = new Date();
    const used = current.lastQuotaReset.toDateString() === now.toDateString() ? current.tokensUsedToday : 0;
    if (used >= current.dailyTokenQuota) {
      await telegramCall(decryptTelegramSecret(connection.botTokenEnc), 'sendMessage', { chat_id: message.chat.id, text: 'Kuota bot hari ini sudah habis. Silakan coba lagi besok.' });
      return res.sendStatus(200);
    }
    const knowledgeBases = await prisma.knowledgeBase.findMany({ where: { botId: connection.botId }, select: { isi_teks: true } });
    const context = knowledgeBases.map((item) => item.isi_teks).filter(Boolean).join('\n') || 'Tidak ada informasi toko yang tersedia.';
    const prompt = `Anda adalah ${connection.bot.nama_bot}. Personality: ${connection.bot.personality}. Instruksi: ${connection.bot.instructions || 'Jawab ramah dan akurat.'}. Gunakan hanya konteks toko berikut; jangan mengarang.\nKONTEKS:\n${context}`;
    const started = Date.now();
    const reply = await generateChatCompletion({ messages: [{ role: 'system', content: prompt }, { role: 'user', content: message.text }], temperature: 0.4 });
    const tokenCount = estimateTokens(message.text) + estimateTokens(reply);
    await prisma.chatLog.create({ data: { botId: connection.botId, platform: 'telegram', userMessage: message.text, aiResponse: reply, response_time_ms: Date.now() - started, tokenCount } });
    await prisma.subscription.update({ where: { id: sub.id }, data: { tokensUsedToday: used + tokenCount, lastQuotaReset: now } });
    logApiUsage({ userId: connection.bot.userId, botId: connection.botId, endpoint: '/api/telegram/webhook', promptTokens: estimateTokens(message.text), completionTokens: estimateTokens(reply), statusCode: 200, latencyMs: Date.now() - started });
    await telegramCall(decryptTelegramSecret(connection.botTokenEnc), 'sendMessage', { chat_id: message.chat.id, text: reply.slice(0, 4096), reply_to_message_id: message.message_id });
  } catch (error: any) {
    console.error('[Telegram] Message processing failed:', error.message);
    try { await telegramCall(decryptTelegramSecret(connection.botTokenEnc), 'sendMessage', { chat_id: message.chat.id, text: 'Maaf, bot sedang mengalami kendala. Silakan coba lagi.' }); } catch { /* Telegram unavailable */ }
  }
  return res.sendStatus(200);
};

export const telegramWebhookReady = (_req: Request, res: Response) => {
  return res.sendStatus(webhookBase() && /^https:\/\//i.test(webhookBase()!) ? 200 : 503);
};
