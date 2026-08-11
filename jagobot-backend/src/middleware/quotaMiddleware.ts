import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

/**
 * Middleware: enforce token quota before processing chat.
 * 
 * Flow:
 * 1. Check if user has active subscription
 * 2. If yes, check if daily quota exceeded
 * 3. If exceeded, reject with 429
 * 4. If not, allow through — token count will be updated AFTER the LLM call
 */
export const enforceTokenQuota = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id || (req as any).user?.userId;
        if (!userId) return next(); // No user context, skip (public endpoints)

        const subscription = await prisma.subscription.findFirst({
            where: { userId: Number(userId), status: 'active' }
        });

        if (!subscription) {
            // No active subscription — allow but with no quota tracking
            // In production, you might want to block non-subscribed users
            return next();
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

        // Check quota
        if (subscription.tokensUsedToday >= subscription.dailyTokenQuota) {
            return res.status(429).json({
                status: 'quota_exceeded',
                message: 'Kuota token harian telah habis. Silakan upgrade paket atau tunggu reset besok.',
                tokensUsedToday: subscription.tokensUsedToday,
                dailyTokenQuota: subscription.dailyTokenQuota
            });
        }

        // Attach subscription info to request for downstream use
        (req as any).subscription = subscription;
        next();
    } catch (error) {
        console.error('[Quota] Middleware error:', error);
        next(); // Don't block on errors
    }
};

/**
 * Called AFTER LLM generates a response — records token usage.
 * Rough estimation: ~1 token per 4 characters for English/Indonesian text.
 */
export const recordTokenUsage = async (userId: number, tokenCount: number) => {
    try {
        const subscription = await prisma.subscription.findFirst({
            where: { userId: Number(userId), status: 'active' }
        });

        if (!subscription) return; // No subscription, no tracking needed

        await prisma.subscription.update({
            where: { id: subscription.id },
            data: { tokensUsedToday: { increment: tokenCount } }
        });
    } catch (error) {
        console.error('[Quota] Failed to record token usage:', error);
    }
};

/**
 * Estimate token count from text (rough approximation).
 * For more accuracy, use a tokenizer like `tiktoken`.
 */
export const estimateTokens = (text: string): number => {
    // Rough estimate: 1 token ≈ 4 characters for Indonesian/English
    return Math.ceil(text.length / 4);
};
