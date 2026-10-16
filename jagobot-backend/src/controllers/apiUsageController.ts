import { Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Controller Monitoring API (Fase 4).
 * Semua endpoint dijaga `requireSuperAdmin` di adminRoutes.ts.
 *
 * Menjawab pertanyaan: "setiap pengguna sudah menghabiskan berapa token,
 * dan berapa sisa kuotanya?"
 */

/** Rentang tanggal dari query (?days=30, default 30; atau ?from=&to=) */
const resolveRange = (query: any): { from: Date; to: Date; days: number } => {
    const to = query.to ? new Date(String(query.to)) : new Date();
    const days = Math.min(365, Math.max(1, Number(query.days) || 30));
    const from = query.from
        ? new Date(String(query.from))
        : new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    return { from, to, days };
};

/**
 * GET /api/admin/api-usage/summary
 * Per pengguna: total token (periode), jumlah request, sisa kuota harian.
 */
export const getUsageSummary = async (req: any, res: Response) => {
    try {
        const { from, to, days } = resolveRange(req.query);

        // Agregasi token per pengguna dalam rentang waktu.
        const grouped = await prisma.apiUsageLog.groupBy({
            by: ['userId'],
            where: { createdAt: { gte: from, lte: to } },
            _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
            _count: { _all: true },
        });

        const userIds = grouped.map(g => g.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds.length ? userIds : [-1] } },
            select: {
                id: true, email: true, nama_toko: true, role: true,
                _count: { select: { bots: true } },
            },
        });
        const userMap = new Map(users.map(u => [u.id, u]));

        // Kuota harian dari langganan aktif.
        const subs = await prisma.subscription.findMany({
            where: { userId: { in: userIds.length ? userIds : [-1] }, status: 'active' },
            select: { userId: true, planType: true, dailyTokenQuota: true, tokensUsedToday: true, endDate: true },
        });
        const subMap = new Map(subs.map(s => [s.userId, s]));

        const data = grouped
            .map(g => {
                const u = userMap.get(g.userId);
                const sub = subMap.get(g.userId);
                const totalTokens = g._sum.totalTokens || 0;
                const quota = sub?.dailyTokenQuota ?? 0;
                const usedToday = sub?.tokensUsedToday ?? 0;
                return {
                    userId: g.userId,
                    email: u?.email ?? '(pengguna dihapus)',
                    nama_toko: u?.nama_toko ?? '-',
                    role: u?.role ?? 'USER',
                    totalBots: u?._count.bots ?? 0,
                    totalTokens,
                    promptTokens: g._sum.promptTokens || 0,
                    completionTokens: g._sum.completionTokens || 0,
                    requestCount: g._count._all,
                    // Kuota
                    hasSubscription: Boolean(sub),
                    planType: sub?.planType ?? null,
                    dailyTokenQuota: quota,
                    tokensUsedToday: usedToday,
                    remainingToday: sub ? Math.max(0, quota - usedToday) : 0,
                    quotaPercentUsed: sub && quota > 0 ? Math.round((usedToday / quota) * 100) : 0,
                    endDate: sub?.endDate ?? null,
                };
            })
            .sort((a, b) => b.totalTokens - a.totalTokens);

        const totals = data.reduce(
            (acc, d) => {
                acc.totalTokens += d.totalTokens;
                acc.requestCount += d.requestCount;
                return acc;
            },
            { totalTokens: 0, requestCount: 0 }
        );

        res.json({
            period: { from, to, days },
            totals: { ...totals, activeUsers: data.length },
            data,
        });
    } catch (error) {
        console.error('[Usage] getUsageSummary error:', error);
        res.status(500).json({ message: 'Gagal mengambil ringkasan pemakaian.' });
    }
};

/**
 * GET /api/admin/api-usage/timeline?days=30
 * Grafik harian: total token + jumlah request.
 */
export const getUsageTimeline = async (req: any, res: Response) => {
    try {
        const { from, to, days } = resolveRange(req.query);

        const logs = await prisma.apiUsageLog.findMany({
            where: { createdAt: { gte: from, lte: to } },
            select: { createdAt: true, totalTokens: true },
        });

        // Susun per hari (YYYY-MM-DD).
        const bucket = new Map<string, { date: string; tokens: number; requests: number }>();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(to.getTime() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().slice(0, 10);
            bucket.set(key, { date: key, tokens: 0, requests: 0 });
        }
        for (const l of logs) {
            const key = l.createdAt.toISOString().slice(0, 10);
            const b = bucket.get(key);
            if (b) {
                b.tokens += l.totalTokens;
                b.requests += 1;
            }
        }

        res.json({ period: { from, to, days }, data: Array.from(bucket.values()) });
    } catch (error) {
        console.error('[Usage] getUsageTimeline error:', error);
        res.status(500).json({ message: 'Gagal mengambil tren pemakaian.' });
    }
};

/**
 * GET /api/admin/api-usage/logs?limit=50&userId=
 * Log terbaru (untuk audit).
 */
export const getUsageLogs = async (req: any, res: Response) => {
    try {
        const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
        const userId = req.query.userId ? Number(req.query.userId) : undefined;

        const logs = await prisma.apiUsageLog.findMany({
            where: userId ? { userId } : undefined,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { user: { select: { email: true, nama_toko: true } } },
        });

        res.json({ data: logs });
    } catch (error) {
        console.error('[Usage] getUsageLogs error:', error);
        res.status(500).json({ message: 'Gagal mengambil log pemakaian.' });
    }
};

/**
 * GET /api/admin/api-usage/models
 * Distribusi pemakaian per model (untuk melihat model mana yang paling dipakai).
 */
export const getUsageByModel = async (req: any, res: Response) => {
    try {
        const { from, to, days } = resolveRange(req.query);
        const grouped = await prisma.apiUsageLog.groupBy({
            by: ['model'],
            where: { createdAt: { gte: from, lte: to } },
            _sum: { totalTokens: true },
            _count: { _all: true },
        });

        res.json({
            period: { from, to, days },
            data: grouped
                .map(g => ({
                    model: g.model || '(tidak tercatat)',
                    totalTokens: g._sum.totalTokens || 0,
                    requestCount: g._count._all,
                }))
                .sort((a, b) => b.totalTokens - a.totalTokens),
        });
    } catch (error) {
        console.error('[Usage] getUsageByModel error:', error);
        res.status(500).json({ message: 'Gagal mengambil pemakaian per model.' });
    }
};
