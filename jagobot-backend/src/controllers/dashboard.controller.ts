// backend/src/controllers/dashboard.controller.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getActiveBot = async (req: any, res: any) => {
    try {
        // Samakan pengambilan ID dengan getDashboardStats
        const idDariToken = (req as any).user.userId || (req as any).user.id;

        // Tambahkan log ini untuk memastikan ID yang terbaca benar (Cek di terminal backend)
        console.log("DEBUG: User ID dari Token adalah:", idDariToken);
        console.log("DEBUG: Query botId dari Frontend adalah:", req.query.botId);
        const bot = await prisma.bot.findFirst({
            where: {
                userId: Number(idDariToken)
            },
            // Urutkan agar bot terbaru/teraktif yang diambil
            orderBy: { id: 'desc' }
        });

        if (!bot) {
            return res.status(404).json({ message: "Bot tidak ditemukan" });
        }
        res.json(bot);
    } catch (error) {
        res.status(500).json({ message: "Gagal mendeteksi bot" });
    }
};

export const getUserBots = async (req: any, res: any) => {
    try {
        const idDariToken = (req as any).user.userId || (req as any).user.id;

        console.log("DEBUG getUserBots: User ID dari Token adalah:", idDariToken);

        const bots = await prisma.bot.findMany({
            where: {
                userId: Number(idDariToken)
            },
            orderBy: { id: 'desc' }
        });

        res.status(200).json({ data: bots });
    } catch (error: any) {
        console.error("Error getUserBots:", error);
        res.status(500).json({ message: "Gagal mengambil daftar bot", error: error.message });
    }
};

export const createBot = async (req: any, res: any) => {
    try {
        const idDariToken = (req as any).user.userId || (req as any).user.id;
        const { nama_bot } = req.body;

        console.log("DEBUG createBot: User ID:", idDariToken);
        console.log("DEBUG createBot: Bot Name:", nama_bot);

        if (!nama_bot || nama_bot.trim() === '') {
            return res.status(400).json({ message: "Nama bot tidak boleh kosong" });
        }

        const newBot = await prisma.bot.create({
            data: {
                userId: Number(idDariToken),
                nama_bot: nama_bot.trim(),
                personality: "Ramah",
                whatsapp_linked: false
            }
        });

        console.log("DEBUG createBot: Bot berhasil dibuat:", newBot);

        res.status(201).json({
            message: "Bot berhasil dibuat",
            data: { bot: newBot }
        });
    } catch (error: any) {
        console.error("Error createBot:", error);
        res.status(500).json({ message: "Gagal membuat bot", error: error.message });
    }
};