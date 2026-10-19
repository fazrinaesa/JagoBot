import { Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Controller Analitik Global (Fase 5).
 * Semua endpoint dijaga `requireSuperAdmin` di adminRoutes.ts.
 *
 * Menjawab: "pertanyaan apa yang paling sering ditanyakan pelanggan
 * di seluruh toko/pengguna?" — diagregasi lintas semua bot.
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

/** Normalisasi pertanyaan: huruf kecil, tanpa tanda baca berlebih, spasi rapat. */
const normalize = (s: string): string =>
    (s || '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

/**
 * GET /api/admin/analytics/top-questions?days=30&limit=20
 *
 * ChatLog.userMessage adalah teks bebas, jadi pengelompokan dilakukan di
 * aplikasi (bukan groupBy SQL) agar variasi kapitalisasi/tanda baca
 * tetap tergabung — mis. "Berapa harga?" dan "berapa harga" dihitung satu.
 */
export const getTopQuestions = async (req: any, res: Response) => {
    try {
        const { from, to, days } = resolveRange(req.query);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        const logs = await prisma.chatLog.findMany({
            where: {
                createdAt: { gte: from, lte: to },
                userMessage: { not: '' },
            },
            select: {
                userMessage: true,
                botId: true,
                createdAt: true,
                bot: { select: { userId: true, nama_bot: true, user: { select: { nama_toko: true } } } },
            },
        });

        // Kelompokkan berdasarkan bentuk ternormalisasi.
        const groups = new Map<string, {
            question: string;      // versi tampilan (pertama kali muncul)
            count: number;
            bots: Set<number>;
            stores: Set<string>;
            lastAsked: Date;
        }>();

        for (const l of logs) {
            const key = normalize(l.userMessage);
            if (!key || key.length < 2) continue;

            let g = groups.get(key);
            if (!g) {
                g = {
                    question: l.userMessage.trim(),
                    count: 0,
                    bots: new Set(),
                    stores: new Set(),
                    lastAsked: l.createdAt,
                };
                groups.set(key, g);
            }
            g.count += 1;
            g.bots.add(l.botId);
            const store = l.bot?.user?.nama_toko;
            if (store) g.stores.add(store);
            if (l.createdAt > g.lastAsked) g.lastAsked = l.createdAt;
        }

        const data = Array.from(groups.values())
            .map(g => ({
                question: g.question,
                count: g.count,
                botCount: g.bots.size,
                storeCount: g.stores.size,
                lastAsked: g.lastAsked,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        const totalQuestions = logs.length;
        const uniqueQuestions = groups.size;

        res.json({
            period: { from, to, days },
            totals: { totalQuestions, uniqueQuestions },
            data,
        });
    } catch (error) {
        console.error('[Analytics] getTopQuestions error:', error);
        res.status(500).json({ message: 'Gagal mengambil pertanyaan populer.' });
    }
};

/**
 * GET /api/admin/analytics/unanswered?days=30&limit=20
 *
 * Mendeteksi pertanyaan yang jawabannya kosong / mengandung pola
 * "belum memiliki informasi" — indikasi Knowledge Base kurang lengkap.
 */
export const getUnanswered = async (req: any, res: Response) => {
    try {
        const { from, to, days } = resolveRange(req.query);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        // Pola jawaban yang menandakan bot tidak punya informasinya.
        const NOT_FOUND_HINTS = [
            'belum memiliki informasi',
            'belum menemukan',
            'tidak ada di dalam konteks',
            'belum mengetahui',
            'tidak tahu',
            'hubungi admin',
            'belum tersedia',
        ];

        const logs = await prisma.chatLog.findMany({
            where: { createdAt: { gte: from, lte: to }, userMessage: { not: '' } },
            select: {
                userMessage: true,
                aiResponse: true,
                createdAt: true,
                bot: { select: { user: { select: { nama_toko: true } } } },
            },
        });

        const groups = new Map<string, {
            question: string; count: number; reason: string;
            stores: Set<string>; lastAsked: Date;
        }>();

        for (const l of logs) {
            const answer = (l.aiResponse || '').toLowerCase();
            const isEmpty = !answer.trim();
            const isNotFound = NOT_FOUND_HINTS.some(h => answer.includes(h));
            if (!isEmpty && !isNotFound) continue;

            const key = normalize(l.userMessage);
            if (!key) continue;

            let g = groups.get(key);
            if (!g) {
                g = {
                    question: l.userMessage.trim(),
                    count: 0,
                    reason: isEmpty ? 'jawaban_kosong' : 'tidak_ditemukan',
                    stores: new Set(),
                    lastAsked: l.createdAt,
                };
                groups.set(key, g);
            }
            g.count += 1;
            const store = l.bot?.user?.nama_toko;
            if (store) g.stores.add(store);
            if (l.createdAt > g.lastAsked) g.lastAsked = l.createdAt;
        }

        const data = Array.from(groups.values())
            .map(g => ({
                question: g.question,
                count: g.count,
                reason: g.reason,
                storeCount: g.stores.size,
                lastAsked: g.lastAsked,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        res.json({ period: { from, to, days }, totals: { unanswered: data.length }, data });
    } catch (error) {
        console.error('[Analytics] getUnanswered error:', error);
        res.status(500).json({ message: 'Gagal mengambil pertanyaan tak terjawab.' });
    }
};

/**
 * GET /api/admin/analytics/overview?days=30
 * Ringkasan global: total chat, jumlah toko aktif, rata-rata respon.
 */
export const getAnalyticsOverview = async (req: any, res: Response) => {
    try {
        const { from, to, days } = resolveRange(req.query);

        const [totalChats, logs] = await Promise.all([
            prisma.chatLog.count({ where: { createdAt: { gte: from, lte: to } } }),
            prisma.chatLog.findMany({
                where: { createdAt: { gte: from, lte: to } },
                select: { botId: true, response_time_ms: true, bot: { select: { userId: true } } },
            }),
        ]);

        const activeBots = new Set(logs.map(l => l.botId)).size;
        const activeUsers = new Set(logs.map(l => l.bot?.userId).filter(Boolean)).size;
        const withTime = logs.filter(l => typeof l.response_time_ms === 'number' && (l.response_time_ms as number) > 0);
        const avgResponseMs = withTime.length
            ? Math.round(withTime.reduce((s, l) => s + (l.response_time_ms as number), 0) / withTime.length)
            : 0;

        res.json({
            period: { from, to, days },
            totals: {
                totalChats,
                activeBots,
                activeUsers,
                avgResponseMs,
                avgResponseSec: Number((avgResponseMs / 1000).toFixed(2)),
            },
        });
    } catch (error) {
        console.error('[Analytics] getAnalyticsOverview error:', error);
        res.status(500).json({ message: 'Gagal mengambil ringkasan analitik.' });
    }
};
