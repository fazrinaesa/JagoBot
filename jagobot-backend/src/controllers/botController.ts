import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateBotSettings = async (req: Request, res: Response) => {
    try {
        const { botId, personality, instructions } = req.body;

        // Update data bot di database
        const updatedBot = await prisma.bot.update({
            where: { id: Number(botId) },
            data: {
                personality: personality, // Menyimpan 'Formal', 'Gaul', dsb.
                instructions: instructions, // Menyimpan teks instruksi khusus
            },
        });

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