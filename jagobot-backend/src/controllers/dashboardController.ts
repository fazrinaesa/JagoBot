import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const idDariToken = (req as any).user.id || (req as any).user.userId;
        const { botId, period } = req.query;

        const userWithBots = await prisma.user.findUnique({
            where: { id: Number(idDariToken) },
            include: { bots: true }
        });

        if (!userWithBots) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const targetBotIds = botId
            ? [Number(botId)]
            : userWithBots.bots.map(bot => bot.id);

        const activeBot = userWithBots.bots.find(b => b.id === Number(botId));
        const rawName = activeBot ? activeBot.nama_bot : userWithBots.nama_toko;
        const displayName = rawName?.replace(/asisten\s+/gi, "");

        // --- LOGIKA FILTER DINAMIS ---
        const now = new Date();
        let startDate: Date;
        // Penentuan rentang waktu untuk perhitungan tren (periode sebelumnya)
        let pastStartDate: Date;

        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        if (period === 'minggu') {
            startDate = new Date();
            startDate.setDate(now.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);

            // Past Start Date: 7 hari sebelum startDate
            pastStartDate = new Date(startDate);
            pastStartDate.setDate(pastStartDate.getDate() - 7);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);

            // Past Start Date: 1 bulan sebelum startDate
            pastStartDate = new Date(startDate);
            pastStartDate.setMonth(pastStartDate.getMonth() - 1);
        }

        // --- 1. HITUNG DATA SEKARANG ---
        const totalChatCount = await prisma.chatLog.count({
            where: {
                botId: { in: targetBotIds },
                timestamp: { gte: startDate, lte: endDate }
            }
        });

        // --- 2. HITUNG DATA PERIODE LALU (UNTUK TREN) ---
        const pastChatCount = await prisma.chatLog.count({
            where: {
                botId: { in: targetBotIds },
                timestamp: { gte: pastStartDate, lt: startDate }
            }
        });

        // Logika Persentase Tren
        const chatDiff = totalChatCount - pastChatCount;
        const chatTrend = pastChatCount > 0
            ? ((chatDiff / pastChatCount) * 100).toFixed(1)
            : (totalChatCount > 0 ? "100" : "0");

        // --- 3. HITUNG RATA-RATA WAKTU RESPON ---
        // Mengasumsikan ada field response_time (dalam ms) di tabel chatLog
        const avgRes = await prisma.chatLog.aggregate({
            _avg: { response_time: true },
            where: {
                botId: { in: targetBotIds },
                timestamp: { gte: startDate }
            }
        });
        const finalAvgRes = avgRes._avg.response_time
            ? (avgRes._avg.response_time / 1000).toFixed(1)
            : "0.0";

        const totalCustomers = await prisma.chatLog.groupBy({
            by: ['customer_name'],
            where: {
                botId: { in: targetBotIds },
                timestamp: { gte: startDate, lte: endDate }
            }
        });

        const customerCount = totalCustomers.length;
        const conversionRate = customerCount > 0
            ? ((totalChatCount / (customerCount * 10)) * 100).toFixed(1)
            : "0";

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentChats = await prisma.chatLog.findMany({
            where: {
                botId: { in: targetBotIds },
                timestamp: { gte: sevenDaysAgo }
            },
            select: { timestamp: true }
        });

        const chartData: { name: string; chats: number; orders: number }[] = [];
        const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = daysOfWeek[d.getDay()];
            const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
            const dateStr = localDate.toISOString().split('T')[0];
            const count = recentChats.filter(chat => {
                const chatDate = new Date(chat.timestamp.getTime() - (chat.timestamp.getTimezoneOffset() * 60000));
                return chatDate.toISOString().split('T')[0] === dateStr;
            }).length;
            chartData.push({ name: dayName, chats: count, orders: 0 });
        }

        // --- RETURN RESPONSE DENGAN DATA BARU ---
        res.status(200).json({
            nama_toko: displayName || "JagoAI Store",
            stats: {
                totalChat: totalChatCount,
                chatTrend: `${chatDiff >= 0 ? '+' : ''}${chatTrend}%`,
                isChatPositive: chatDiff >= 0,
                pelangganBaru: customerCount,
                tingkatKonversi: `${conversionRate}%`,
                avgResponse: `${finalAvgRes}s`, // Waktu respon real-time
                chartData: chartData
            }
        });

    } catch (error: any) {
        console.error("Prisma Error:", error.message);
        res.status(500).json({
            message: "Gagal mengambil data dashboard",
            error: error.message
        });
    }
};