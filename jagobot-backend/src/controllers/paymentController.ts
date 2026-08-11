import { Request, Response } from 'express';
import prisma from '../lib/prisma';

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

        if (!planType || !amount) {
            return res.status(400).json({ message: 'planType dan amount wajib diisi' });
        }

        // Pricing reference
        const pricing: Record<string, number> = {
            'basic': 349000,
            'whatsapp': 139000,
            'telegram': 95999,
            'whatsapp+telegram': 234999,
        };

        const expectedAmount = pricing[planType];
        if (expectedAmount && Number(amount) < expectedAmount) {
            return res.status(400).json({
                message: `Jumlah transfer kurang. Harga ${planType}: Rp${expectedAmount.toLocaleString('id-ID')}`
            });
        }

        // Check if proof file was uploaded (handled by upload middleware)
        const proofUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : null;

        // Create or update subscription to pending
        let subscription = await prisma.subscription.findFirst({
            where: { userId: Number(userId), status: { in: ['inactive', 'expired', 'pending'] } },
            orderBy: { createdAt: 'desc' }
        });

        if (!subscription) {
            subscription = await prisma.subscription.create({
                data: {
                    userId: Number(userId),
                    planType,
                    status: 'pending',
                    dailyTokenQuota: planType === 'basic' ? 5000 : planType.includes('whatsapp') ? 15000 : 10000,
                }
            });
        } else {
            subscription = await prisma.subscription.update({
                where: { id: subscription.id },
                data: { planType, status: 'pending' }
            });
        }

        // Create payment proof record
        const proof = await prisma.paymentProof.create({
            data: {
                userId: Number(userId),
                subscriptionId: subscription.id,
                amount: Number(amount),
                proofUrl,
                status: 'pending',
            }
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

        if (action === 'approve') {
            // Activate subscription
            const now = new Date();
            const endDate = new Date(now);
            endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

            await prisma.$transaction([
                prisma.paymentProof.update({
                    where: { id: proof.id },
                    data: { status: 'approved', adminNote: adminNote || null }
                }),
                prisma.subscription.update({
                    where: { id: proof.subscriptionId! },
                    data: {
                        status: 'active',
                        startDate: now,
                        endDate,
                        tokensUsedToday: 0,
                        lastQuotaReset: now,
                    }
                })
            ]);

            res.json({ message: 'Pembayaran disetujui. Subscription diaktifkan.' });
        } else {
            // Reject
            await prisma.paymentProof.update({
                where: { id: proof.id },
                data: { status: 'rejected', adminNote: adminNote || 'Ditolak' }
            });

            if (proof.subscriptionId) {
                await prisma.subscription.update({
                    where: { id: proof.subscriptionId },
                    data: { status: 'inactive' }
                });
            }

            res.json({ message: 'Pembayaran ditolak.' });
        }
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
