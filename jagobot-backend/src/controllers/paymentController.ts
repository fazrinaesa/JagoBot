import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import prisma from '../lib/prisma';
import { isCdnConfigured, uploadToCdn } from '../lib/cdn';

// ─── USER-FACING: Get current subscription ───

export const getMySubscription = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const subscription = await prisma.subscription.findFirst({
            where: { userId: Number(userId) },
            orderBy: { createdAt: 'desc' }
        });

        // Check if subscription has expired
        if (subscription && subscription.endDate && subscription.endDate < new Date() && subscription.status === 'active') {
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: 'expired' }
            });
            subscription.status = 'expired';
        }

        res.json({ data: subscription });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil data subscription', error: error.message });
    }
};

// ─── USER-FACING: Submit payment proof ───

export const submitPaymentProof = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const { planType, amount } = req.body;

        const pricing: Record<string, number> = {
            basic: 349000,
            whatsapp: 139000,
            telegram: 95999,
            'whatsapp+telegram': 234999,
        };
        const expectedAmount = pricing[String(planType)];
        if (!expectedAmount) return res.status(400).json({ message: 'Paket tidak valid.' });
        if (Number(amount) !== expectedAmount) {
            return res.status(400).json({ message: `Nominal paket harus Rp${expectedAmount.toLocaleString('id-ID')}.` });
        }

        const file = (req as any).file;
        if (!file) return res.status(400).json({ message: 'Unggah bukti transfer terlebih dahulu.' });
        if (!file.buffer?.length) return res.status(400).json({ message: 'Berkas bukti kosong atau tidak terbaca.' });

        const ext = (file.originalname.match(/\.[a-z0-9]+$/i)?.[0] || '.jpg').toLowerCase();
        const proofFileName = `proof-${userId}-${Date.now()}${ext}`;
        let proofUrl: string;
        if (isCdnConfigured()) {
            const asset = await uploadToCdn(file.buffer, proofFileName, file.mimetype);
            proofUrl = asset.url;
        } else {
            const dir = path.join(__dirname, '../../uploads/proofs');
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, proofFileName), file.buffer);
            proofUrl = `/uploads/proofs/${proofFileName}`;
        }

        const existingPending = await prisma.paymentProof.findFirst({
            where: { userId: Number(userId), status: 'pending' },
            select: { id: true },
        });
        if (existingPending) return res.status(409).json({ message: 'Pembayaran Anda sedang menunggu verifikasi.' });

        const { subscription, proof } = await prisma.$transaction(async (tx) => {
            const subscription = await tx.subscription.create({
                data: {
                    userId: Number(userId),
                    planType: String(planType),
                    status: 'pending',
                    dailyTokenQuota: ({ basic: 5000, whatsapp: 15000, telegram: 10000, 'whatsapp+telegram': 20000 } as Record<string, number>)[String(planType)],
                },
            });
            const proof = await tx.paymentProof.create({
                data: {
                    userId: Number(userId),
                    subscriptionId: subscription.id,
                    amount: expectedAmount,
                    proofUrl,
                    status: 'pending',
                },
            });
            return { subscription, proof };
        });

        res.status(201).json({
            message: 'Bukti pembayaran berhasil dikirim. Menunggu konfirmasi admin.',
            data: proof,
            subscriptionId: subscription.id
        });
    } catch (error: any) {
        console.error('[Payment] Submit error:', error);
        res.status(500).json({ message: 'Gagal mengirim bukti pembayaran', error: error.message });
    }
};

// ─── USER-FACING: Get my payment proofs ───

export const getMyPaymentProofs = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const proofs = await prisma.paymentProof.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: 'desc' },
            include: { subscription: { select: { planType: true, status: true } } }
        });
        res.json({ data: proofs });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil riwayat pembayaran', error: error.message });
    }
};

// ─── USER-FACING: Check token quota ───

export const checkTokenQuota = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user.userId;
        const subscription = await prisma.subscription.findFirst({
            where: { userId: Number(userId), status: 'active' },
        });

        if (!subscription) {
            return res.json({ data: { hasSubscription: false, tokensUsedToday: 0, dailyTokenQuota: 0 } });
        }

        // Reset daily counter if new day
        const now = new Date();
        const lastReset = subscription.lastQuotaReset;
        const isNewDay = now.toDateString() !== lastReset.toDateString();

        if (isNewDay) {
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: { tokensUsedToday: 0, lastQuotaReset: now }
            });
            subscription.tokensUsedToday = 0;
        }

        res.json({
            data: {
                hasSubscription: true,
                planType: subscription.planType,
                tokensUsedToday: subscription.tokensUsedToday,
                dailyTokenQuota: subscription.dailyTokenQuota,
                remaining: subscription.dailyTokenQuota - subscription.tokensUsedToday,
                endDate: subscription.endDate
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal cek kuota', error: error.message });
    }
};

// ─── ADMIN: List all pending payment proofs ───

export const adminListPaymentProofs = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const proofs = await prisma.paymentProof.findMany({
            where: status ? { status: String(status) } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, nama_toko: true, email: true } },
                subscription: { select: { planType: true, status: true } }
            }
        });
        res.json({ data: proofs });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil data pembayaran', error: error.message });
    }
};

// ─── ADMIN: Approve or reject payment ───

export const adminReviewPayment = async (req: Request, res: Response) => {
    try {
        const { proofId, action, adminNote } = req.body;

        if (!proofId || !action || !['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'proofId dan action (approve/reject) wajib diisi' });
        }

        const proof = await prisma.paymentProof.findUnique({
            where: { id: Number(proofId) },
            include: { subscription: true }
        });

        if (!proof) {
            return res.status(404).json({ message: 'Bukti pembayaran tidak ditemukan' });
        }

        if (proof.status !== 'pending') {
            return res.status(409).json({ message: 'Pembayaran ini sudah pernah diproses.' });
        }
        if (!proof.proofUrl || !proof.subscriptionId || !proof.subscription) {
            return res.status(400).json({ message: 'Bukti atau langganan terkait tidak lengkap.' });
        }

        const pricing: Record<string, number> = {
            basic: 349000, whatsapp: 139000, telegram: 95999, 'whatsapp+telegram': 234999,
        };
        if (pricing[proof.subscription.planType] !== proof.amount) {
            return res.status(400).json({ message: 'Nominal bukti tidak sesuai harga paket.' });
        }
        if (proof.subscription.status !== 'pending') {
            return res.status(409).json({ message: 'Status langganan tidak lagi menunggu pembayaran.' });
        }

        if (action === 'approve') {
            const now = new Date();
            const active = await prisma.subscription.findFirst({
                where: { userId: proof.userId, status: 'active', endDate: { gt: now } },
                orderBy: { endDate: 'desc' },
                select: { endDate: true },
            });
            const startDate = active?.endDate && active.endDate > now ? active.endDate : now;
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);

            const processed = await prisma.$transaction(async (tx) => {
                const claimed = await tx.paymentProof.updateMany({
                    where: { id: proof.id, status: 'pending' },
                    data: { status: 'approved', adminNote: adminNote || null },
                });
                if (claimed.count !== 1) return false;
                const activated = await tx.subscription.updateMany({
                    where: { id: proof.subscriptionId!, status: 'pending' },
                    data: { status: 'active', startDate, endDate, tokensUsedToday: 0, lastQuotaReset: now },
                });
                if (activated.count !== 1) throw new Error('Langganan tidak lagi berstatus pending.');
                return true;
            });
            if (!processed) return res.status(409).json({ message: 'Pembayaran sudah diproses oleh admin lain.' });
            return res.json({ message: 'Pembayaran disetujui. Subscription diaktifkan.' });
        }

        const processed = await prisma.$transaction(async (tx) => {
            const claimed = await tx.paymentProof.updateMany({
                where: { id: proof.id, status: 'pending' },
                data: { status: 'rejected', adminNote: adminNote || 'Ditolak' },
            });
            if (claimed.count !== 1) return false;
            const rejected = await tx.subscription.updateMany({
                where: { id: proof.subscriptionId!, status: 'pending' },
                data: { status: 'inactive' },
            });
            if (rejected.count !== 1) throw new Error('Langganan tidak lagi berstatus pending.');
            return true;
        });
        if (!processed) return res.status(409).json({ message: 'Pembayaran sudah diproses oleh admin lain.' });
        return res.json({ message: 'Pembayaran ditolak.' });
    } catch (error: any) {
        console.error('[Payment] Admin review error:', error);
        res.status(500).json({ message: 'Gagal memproses review', error: error.message });
    }
};

// ─── ADMIN: Get all subscriptions ───

export const adminListSubscriptions = async (req: Request, res: Response) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, nama_toko: true, email: true } },
                paymentProofs: { orderBy: { createdAt: 'desc' }, take: 1 }
            }
        });
        res.json({ data: subscriptions });
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil data subscription', error: error.message });
    }
};
