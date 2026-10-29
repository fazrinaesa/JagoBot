import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getChatLogs = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user?.userId ?? (req as any).user?.id);
    const botId = Number(req.query.botId);
    if (!Number.isInteger(botId) || botId <= 0) {
      return res.status(400).json({ message: 'botId tidak valid' });
    }

    const bot = await prisma.bot.findFirst({ where: { id: botId, userId }, select: { id: true } });
    if (!bot) return res.status(404).json({ message: 'Bot tidak ditemukan' });

    const chats = await prisma.chatLog.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, botId: true, userMessage: true, aiResponse: true, platform: true, createdAt: true },
    });
    return res.json({ data: chats });
  } catch (error) {
    console.error('Gagal mengambil log chat:', error);
    return res.status(500).json({ message: 'Gagal mengambil log chat' });
  }
};

export default getChatLogs;
