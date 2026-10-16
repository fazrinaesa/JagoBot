import prisma from './prisma';

/**
 * Pencatatan pemakaian API (Fase 4).
 *
 * Dipanggil setelah setiap pemanggilan LLM agar dashboard monitoring bisa
 * menampilkan: total token per pengguna, sisa kuota, dan tren harian.
 *
 * Penting: pencatatan TIDAK BOLEH menggagalkan permintaan chat.
 * Semua fungsi di sini menelan error dan hanya mencatat ke console.
 */

export interface UsageInput {
    userId?: number | null;
    botId?: number | null;
    apiKeyId?: number | null;
    endpoint: string;
    model?: string | null;
    promptTokens?: number;
    completionTokens?: number;
    statusCode?: number | null;
    latencyMs?: number | null;
}

/**
 * Estimasi token bila provider tidak mengirim data usage.
 * 1 token ≈ 4 karakter (Indonesia/Inggris).
 */
export const estimateTokens = (text: string): number =>
    text ? Math.ceil(text.length / 4) : 0;

/**
 * Catat satu pemakaian. Aman dipanggil tanpa await (fire-and-forget).
 */
export const logApiUsage = async (input: UsageInput): Promise<void> => {
    try {
        // Tanpa userId kita tidak bisa menautkan ke pengguna — lewati.
        if (!input.userId) return;

        const promptTokens = input.promptTokens ?? 0;
        const completionTokens = input.completionTokens ?? 0;
        const totalTokens = promptTokens + completionTokens;

        await prisma.apiUsageLog.create({
            data: {
                userId: Number(input.userId),
                botId: input.botId ? Number(input.botId) : null,
                apiKeyId: input.apiKeyId ? Number(input.apiKeyId) : null,
                endpoint: input.endpoint,
                model: input.model ?? null,
                promptTokens,
                completionTokens,
                totalTokens,
                statusCode: input.statusCode ?? null,
                latencyMs: input.latencyMs ?? null,
            },
        });
    } catch (err: any) {
        console.warn('[Usage] Gagal mencatat pemakaian API:', err?.message || err);
    }
};

/**
 * Cari pemilik bot (userId) — dipakai endpoint publik yang tidak punya token.
 */
export const resolveBotOwner = async (botId: number | string): Promise<number | null> => {
    try {
        const bot = await prisma.bot.findUnique({
            where: { id: Number(botId) },
            select: { userId: true },
        });
        return bot?.userId ?? null;
    } catch {
        return null;
    }
};
