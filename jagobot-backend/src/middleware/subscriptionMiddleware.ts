import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

/** Fail-closed: only a bot owner with a currently active subscription can run chat. */
export const requireActiveBotSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const botId = Number(req.body?.botId);
        if (!Number.isInteger(botId) || botId <= 0) {
            return res.status(400).json({ message: 'botId tidak valid.' });
        }

        const bot = await prisma.bot.findUnique({
            where: { id: botId },
            select: { id: true, userId: true },
        });
        if (!bot) return res.status(404).json({ message: 'Bot tidak ditemukan.' });

        const now = new Date();
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: bot.userId,
                status: 'active',
                OR: [{ endDate: null }, { endDate: { gt: now } }],
            },
            orderBy: { endDate: 'desc' },
            select: { id: true, endDate: true, dailyTokenQuota: true, tokensUsedToday: true, lastQuotaReset: true },
        });
        if (!subscription) {
            return res.status(402).json({
                status: 'subscription_required',
                message: 'Langganan belum aktif. Selesaikan pembayaran dan tunggu verifikasi sebelum memakai integrasi.',
            });
        }

        (req as any).botOwnerId = bot.userId;
        (req as any).subscription = subscription;
        return next();
    } catch (error) {
        console.error('[Subscription] Gate error:', error);
        return res.status(503).json({ message: 'Status langganan tidak dapat diverifikasi. Coba lagi.' });
    }
};

/** Authenticated chat must also use a bot owned by the logged-in account. */
export const requireOwnedActiveBotSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const botId = Number(req.body?.botId);
        const userId = Number((req as any).user?.userId || (req as any).user?.id);
        if (!Number.isInteger(botId) || botId <= 0 || !Number.isInteger(userId)) {
            return res.status(400).json({ message: 'botId tidak valid.' });
        }

        const bot = await prisma.bot.findFirst({
            where: { id: botId, userId },
            select: { id: true, userId: true },
        });
        if (!bot) return res.status(404).json({ message: 'Bot tidak ditemukan atau bukan milik akun Anda.' });

        const now = new Date();
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'active',
                OR: [{ endDate: null }, { endDate: { gt: now } }],
            },
            orderBy: { endDate: 'desc' },
            select: { id: true, endDate: true, dailyTokenQuota: true, tokensUsedToday: true, lastQuotaReset: true },
        });
        if (!subscription) {
            return res.status(402).json({
                status: 'subscription_required',
                message: 'Langganan belum aktif. Selesaikan pembayaran dan tunggu verifikasi sebelum memakai bot.',
            });
        }

        (req as any).botOwnerId = userId;
        (req as any).subscription = subscription;
        return next();
    } catch (error) {
        console.error('[Subscription] Gate error:', error);
        return res.status(503).json({ message: 'Status langganan tidak dapat diverifikasi. Coba lagi.' });
    }
};

/** Require a valid active subscription for authenticated integration management/actions. */
export const requireUserActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number((req as any).user?.userId || (req as any).user?.id);
        const now = new Date();
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'active',
                OR: [{ endDate: null }, { endDate: { gt: now } }],
            },
            select: { id: true },
        });
        if (!subscription) {
            return res.status(402).json({
                status: 'subscription_required',
                message: 'Langganan belum aktif. Selesaikan pembayaran dan tunggu verifikasi sebelum memakai integrasi.',
            });
        }
        return next();
    } catch (error) {
        console.error('[Subscription] Gate error:', error);
        return res.status(503).json({ message: 'Status langganan tidak dapat diverifikasi. Coba lagi.' });
    }
};

export const requireActiveSubscription = requireUserActiveSubscription;
