import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getGoogleAuthUrl, handleOAuthCallback, syncSheetToKnowledgeBase } from '../lib/googleSheets';

// ─── Get OAuth URL for a bot ───
export const getAuthUrl = async (req: Request, res: Response) => {
    try {
        const { botId } = req.body;
        if (!botId) return res.status(400).json({ message: 'botId wajib diisi' });

        // Verify bot ownership
        const userId = (req as any).user.id || (req as any).user.userId;
        const bot = await prisma.bot.findFirst({
            where: { id: Number(botId), userId: Number(userId) }
        });
        if (!bot) return res.status(404).json({ message: 'Bot tidak ditemukan' });

        const url = getGoogleAuthUrl(Number(botId));
        res.json({ url });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal generate OAuth URL', error: error.message });
    }
};

// ─── OAuth callback (redirect from Google) ───
export const oauthCallback = async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;
        if (!code || !state) return res.status(400).json({ message: 'Missing code or state' });

        await handleOAuthCallback(String(code), String(state));

        // Redirect back to dashboard
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/integration?connected=sheets`);
    } catch (error: any) {
        console.error('[Sheets] OAuth callback error:', error);
        res.status(500).json({ message: 'OAuth gagal', error: error.message });
    }
};

// ─── Save/update sheets connection settings ───
export const saveConnection = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const { botId, spreadsheetId, sheetName, pollIntervalMin } = req.body;

        if (!botId || !spreadsheetId) {
            return res.status(400).json({ message: 'botId dan spreadsheetId wajib diisi' });
        }

        // Verify ownership
        const bot = await prisma.bot.findFirst({
            where: { id: Number(botId), userId: Number(userId) }
        });
        if (!bot) return res.status(404).json({ message: 'Bot tidak ditemukan' });

        // Check if OAuth tokens exist
        const existing = await prisma.googleSheetsConnection.findFirst({
            where: { botId: Number(botId) }
        });

        if (existing) {
            await prisma.googleSheetsConnection.update({
                where: { id: existing.id },
                data: {
                    spreadsheetId,
                    sheetName: sheetName || 'Sheet1',
                    pollIntervalMin: pollIntervalMin || 60,
                    isActive: true,
                }
            });
        } else {
            return res.status(400).json({
                message: 'Belum terhubung ke Google. Klik "Hubungkan Google" terlebih dahulu.'
            });
        }

        res.json({ message: 'Koneksi berhasil disimpan' });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal menyimpan koneksi', error: error.message });
    }
};

// ─── Get connection info for a bot ───
export const getConnection = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const { botId } = req.query;

        const connection = await prisma.googleSheetsConnection.findFirst({
            where: {
                botId: Number(botId),
                bot: { userId: Number(userId) }
            },
            select: {
                id: true,
                spreadsheetId: true,
                sheetName: true,
                pollIntervalMin: true,
                lastSyncedAt: true,
                isActive: true,
                createdAt: true,
            }
        });

        res.json({ data: connection });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil data koneksi', error: error.message });
    }
};

// ─── Manual sync trigger ───
export const manualSync = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const { botId } = req.body;

        const bot = await prisma.bot.findFirst({
            where: { id: Number(botId), userId: Number(userId) }
        });
        if (!bot) return res.status(404).json({ message: 'Bot tidak ditemukan' });

        const result = await syncSheetToKnowledgeBase(Number(botId));
        res.json({ message: 'Sinkronisasi berhasil', data: result });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal sinkronisasi', error: error.message });
    }
};

// ─── Disconnect / deactivate ───
export const disconnect = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const { botId } = req.body;

        const connection = await prisma.googleSheetsConnection.findFirst({
            where: { botId: Number(botId), bot: { userId: Number(userId) } }
        });

        if (!connection) return res.status(404).json({ message: 'Koneksi tidak ditemukan' });

        await prisma.googleSheetsConnection.update({
            where: { id: connection.id },
            data: { isActive: false }
        });

        res.json({ message: 'Koneksi Google Sheets dinonaktifkan' });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal memutuskan koneksi', error: error.message });
    }
};
