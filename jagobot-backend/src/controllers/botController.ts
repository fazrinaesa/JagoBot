import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// ✅ GET profil bot berdasarkan botId (untuk load data saat halaman Profil Bot dibuka)
export const getBotProfile = async (req: Request, res: Response) => {
    try {
        const { botId } = req.query;
        const userId = (req as any).user.userId || (req as any).user.id;

        if (!botId) {
            return res.status(400).json({ status: 'error', message: 'botId diperlukan' });
        }

        const bot = await prisma.bot.findFirst({
            where: {
                id: Number(botId),
                userId: Number(userId) // verifikasi ownership
            }
        });

        if (!bot) {
            return res.status(404).json({ status: 'error', message: 'Bot tidak ditemukan atau bukan milik Anda' });
        }

        res.status(200).json({
            status: 'success',
            data: bot
        });
    } catch (error) {
        console.error('Get Bot Profile Error:', error);
        res.status(500).json({ status: 'error', message: 'Gagal mengambil profil bot' });
    }
};

// ✅ PATCH update profil bot (personality & instructions)
export const updateBotSettings = async (req: Request, res: Response) => {
    try {
        const { botId, personality, instructions } = req.body;
        const userId = (req as any).user.userId || (req as any).user.id;

        if (!botId) {
            return res.status(400).json({ status: 'error', message: 'botId diperlukan' });
        }

        // Verifikasi ownership sebelum update
        const existingBot = await prisma.bot.findFirst({
            where: { id: Number(botId), userId: Number(userId) }
        });

        if (!existingBot) {
            return res.status(403).json({ status: 'error', message: 'Bot tidak ditemukan atau bukan milik Anda' });
        }

        // Update data bot di database
        const updatedBot = await prisma.bot.update({
            where: { id: Number(botId) },
            data: {
                personality: personality,       // Menyimpan 'formal', 'casual', 'helpful', dsb.
                instructions: instructions,     // Menyimpan teks instruksi khusus
            },
        });

        console.log(`✅ [BotController] Bot ID ${botId} diperbarui: personality=${personality}`);

        res.status(200).json({
            status: 'success',
            message: 'Profil Bot berhasil diperbarui!',
            data: updatedBot,
        });
    } catch (error) {
        console.error('Update Bot Error:', error);
        res.status(500).json({ status: 'error', message: 'Gagal memperbarui Profil Bot' });
    }
};