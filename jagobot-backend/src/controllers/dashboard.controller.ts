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