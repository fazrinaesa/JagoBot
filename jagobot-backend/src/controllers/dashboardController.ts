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
                createdAt: { gte: startDate, lte: endDate }  // ✅ timestamp → createdAt
            }
        });

        // --- 2. HITUNG DATA PERIODE LALU (UNTUK TREN) ---
        const pastChatCount = await prisma.chatLog.count({
            where: {
                botId: { in: targetBotIds },
                createdAt: { gte: pastStartDate, lt: startDate }  // ✅ timestamp → createdAt
            }
        });

        // Logika Persentase Tren
        const chatDiff = totalChatCount - pastChatCount;
        const chatTrend = pastChatCount > 0
            ? ((chatDiff / pastChatCount) * 100).toFixed(1)
            : (totalChatCount > 0 ? "100" : "0");

        // --- 3. HITUNG RATA-RATA WAKTU RESPON ---
        const avgResponseQuery = await prisma.chatLog.aggregate({
            _avg: { response_time_ms: true },
            where: {
                botId: { in: targetBotIds },
                createdAt: { gte: startDate, lte: endDate }
            }
        });
        
        const finalAvgRes = avgResponseQuery._avg.response_time_ms 
            ? (avgResponseQuery._avg.response_time_ms / 1000).toFixed(1) 
            : "0.0";

        // ✅ Hitung sumber platform untuk pelanggan unik
        const totalCustomers = await prisma.chatLog.groupBy({
            by: ['platform'],
            where: {
                botId: { in: targetBotIds },
                createdAt: { gte: startDate, lte: endDate }
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
                createdAt: { gte: sevenDaysAgo } 
            },
            select: { createdAt: true } 
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
                const chatDate = new Date(chat.createdAt.getTime() - (chat.createdAt.getTimezoneOffset() * 60000));
                return chatDate.toISOString().split('T')[0] === dateStr;
            }).length;
            chartData.push({ name: dayName, chats: count, orders: 0 });
        }

        // --- RETURN RESPONSE DENGAN DATA BARU ---
        res.status(200).json({
            nama_toko: displayName || "Toko JagoBot",
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

export const getAnalyticsStats = async (req: Request, res: Response) => {
    try {
        const idDariToken = (req as any).user.id || (req as any).user.userId;
        const { botId, period } = req.query;

        // Verifikasi ownership
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

        const now = new Date();
        let startDate: Date;
        
        if (period === 'minggu') {
            startDate = new Date();
            startDate.setDate(now.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // 1. Total Percakapan
        const totalChats = await prisma.chatLog.count({
            where: {
                botId: { in: targetBotIds },
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        // 2. Waktu Respon
        const avgResponseQuery = await prisma.chatLog.aggregate({
            _avg: { response_time_ms: true },
            where: {
                botId: { in: targetBotIds },
                createdAt: { gte: startDate, lte: endDate }
            }
        });
        const responseTimeSec = avgResponseQuery._avg.response_time_ms 
            ? (avgResponseQuery._avg.response_time_ms / 1000).toFixed(1) 
            : "0.0";

        // 3. Tingkat Penyelesaian
        // Asumsi: Semua chat yang tercatat di ChatLog = sukses dibalas AI.
        const completionRate = totalChats > 0 ? 100 : 0;

        // 4. Volume Chat Harian (Line/Bar Chart)
        const recentChats = await prisma.chatLog.findMany({
            where: {
                botId: { in: targetBotIds },
                createdAt: { gte: startDate, lte: endDate }
            },
            select: { createdAt: true }
        });

        const chatData: { name: string; chats: number }[] = [];
        const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const numDays = period === 'minggu' ? 7 : now.getDate();
        
        for (let i = numDays - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            let dayName = "";
            if (period === 'minggu') {
                 dayName = daysOfWeek[d.getDay()];
            } else {
                 dayName = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            }
            
            const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
            const dateStr = localDate.toISOString().split('T')[0];
            const count = recentChats.filter(chat => {
                const chatDate = new Date(chat.createdAt.getTime() - (chat.createdAt.getTimezoneOffset() * 60000));
                return chatDate.toISOString().split('T')[0] === dateStr;
            }).length;
            chatData.push({ name: dayName, chats: count });
        }

        // 5. Sumber Chat (Donut Chart)
        const sources = await prisma.chatLog.groupBy({
            by: ['platform'],
            _count: { platform: true },
            where: {
                botId: { in: targetBotIds },
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        const totalSourceCount = sources.reduce((acc, curr) => acc + curr._count.platform, 0);
        
        const colors = ["#10b981", "#1800ad", "#94a3b8", "#f59e0b"];
        const sourceData = sources.map((s, idx) => ({
            name: s.platform,
            value: totalSourceCount > 0 ? Math.round((s._count.platform / totalSourceCount) * 100) : 0,
            count: s._count.platform,
            color: colors[idx % colors.length]
        }));

        res.status(200).json({
            status: "success",
            data: {
                totalChats,
                responseTime: `${responseTimeSec}s`,
                completionRate: `${completionRate}%`,
                chatData,
                sourceData
            }
        });

    } catch (error: any) {
        console.error("Get Analytics Error:", error.message);
        res.status(500).json({ status: "error", message: "Gagal mengambil data analitik" });
    }
};