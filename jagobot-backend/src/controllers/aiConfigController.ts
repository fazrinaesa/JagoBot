import { Response } from 'express';
import prisma from '../lib/prisma';
import { encryptKey, decryptKey, maskKey } from '../lib/cryptoKey';

/**
 * Controller Konfigurasi AI — Fase 2
 * Semua endpoint dijaga `requireSuperAdmin` di adminRoutes.ts.
 *
 * Provider yang didukung:
 *   - "gemini"            → pakai endpoint resmi Google (baseUrl diabaikan)
 *   - "openai-compatible" → mis. 9router, OpenRouter, dsb (butuh baseUrl)
 */

const VALID_PROVIDERS = ['gemini', 'openai-compatible'];

/** Bentuk data aman untuk dikirim ke frontend (tanpa key polos). */
const toPublic = (p: any) => ({
    id: p.id,
    label: p.label,
    provider: p.provider,
    baseUrl: p.baseUrl,
    model: p.model,
    priority: p.priority,
    isActive: p.isActive,
    maxTokens: p.maxTokens,
    temperature: p.temperature,
    lastStatus: p.lastStatus,
    lastCheckedAt: p.lastCheckedAt,
    createdAt: p.createdAt,
    // Hanya bocorkan bentuk tersensor, bukan key asli.
    apiKeyMasked: maskKey(decryptKey(p.apiKeyEnc)),
    hasKey: Boolean(p.apiKeyEnc),
});

/**
 * GET /api/admin/ai/providers
 */
export const listProviders = async (_req: any, res: Response) => {
    try {
        const providers = await prisma.aiProviderConfig.findMany({
            orderBy: [{ priority: 'asc' }, { id: 'asc' }],
        });
        res.json({ data: providers.map(toPublic) });
    } catch (error) {
        console.error('[AI] listProviders error:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar provider AI.' });
    }
};

/**
 * POST /api/admin/ai/providers   body: { label, provider, baseUrl?, apiKey, model, priority?, maxTokens?, temperature? }
 */
export const createProvider = async (req: any, res: Response) => {
    try {
        const { label, provider, baseUrl, apiKey, model, priority, maxTokens, temperature } = req.body;

        if (!label || !model || !apiKey) {
            return res.status(400).json({ message: 'Field "label", "model", dan "apiKey" wajib diisi.' });
        }
        if (provider && !VALID_PROVIDERS.includes(provider)) {
            return res.status(400).json({ message: `Provider tidak valid. Pilih: ${VALID_PROVIDERS.join(', ')}` });
        }
        const finalProvider = provider || 'openai-compatible';
        if (finalProvider === 'openai-compatible' && !baseUrl) {
            return res.status(400).json({ message: 'Base URL wajib diisi untuk provider openai-compatible.' });
        }

        const created = await prisma.aiProviderConfig.create({
            data: {
                label,
                provider: finalProvider,
                baseUrl: finalProvider === 'gemini' ? null : baseUrl,
                apiKeyEnc: encryptKey(apiKey),
                model,
                priority: Number(priority) || 1,
                maxTokens: maxTokens ? Number(maxTokens) : null,
                temperature: temperature !== undefined && temperature !== null ? Number(temperature) : null,
            },
        });

        res.status(201).json({ message: 'Provider AI berhasil ditambahkan.', data: toPublic(created) });
    } catch (error) {
        console.error('[AI] createProvider error:', error);
        res.status(500).json({ message: 'Gagal menambahkan provider AI.' });
    }
};

/**
 * PUT /api/admin/ai/providers/:id
 * Semua field opsional. `apiKey` hanya diubah bila dikirim & tidak kosong.
 */
export const updateProvider = async (req: any, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { label, provider, baseUrl, apiKey, model, priority, isActive, maxTokens, temperature } = req.body;

        if (provider && !VALID_PROVIDERS.includes(provider)) {
            return res.status(400).json({ message: `Provider tidak valid. Pilih: ${VALID_PROVIDERS.join(', ')}` });
        }

        const data: any = {};
        if (label !== undefined) data.label = label;
        if (provider !== undefined) data.provider = provider;
        if (baseUrl !== undefined) data.baseUrl = baseUrl;
        if (model !== undefined) data.model = model;
        if (priority !== undefined) data.priority = Number(priority);
        if (isActive !== undefined) data.isActive = Boolean(isActive);
        if (maxTokens !== undefined) data.maxTokens = maxTokens === null ? null : Number(maxTokens);
        if (temperature !== undefined) data.temperature = temperature === null ? null : Number(temperature);
        // Key hanya diganti bila benar-benar diisi.
        if (apiKey) data.apiKeyEnc = encryptKey(apiKey);

        const updated = await prisma.aiProviderConfig.update({ where: { id }, data });
        res.json({ message: 'Provider AI berhasil diperbarui.', data: toPublic(updated) });
    } catch (error: any) {
        console.error('[AI] updateProvider error:', error);
        if (error?.code === 'P2025') return res.status(404).json({ message: 'Provider tidak ditemukan.' });
        res.status(500).json({ message: 'Gagal memperbarui provider AI.' });
    }
};

/**
 * DELETE /api/admin/ai/providers/:id
 */
export const deleteProvider = async (req: any, res: Response) => {
    try {
        const id = Number(req.params.id);
        await prisma.aiProviderConfig.delete({ where: { id } });
        res.json({ message: 'Provider AI berhasil dihapus.' });
    } catch (error: any) {
        console.error('[AI] deleteProvider error:', error);
        if (error?.code === 'P2025') return res.status(404).json({ message: 'Provider tidak ditemukan.' });
        res.status(500).json({ message: 'Gagal menghapus provider AI.' });
    }
};

/**
 * PUT /api/admin/ai/providers/reorder   body: { order: [id1, id2, ...] }
 * Menetapkan ulang priority sesuai urutan array (1 = dicoba pertama).
 */
export const reorderProviders = async (req: any, res: Response) => {
    try {
        const { order } = req.body;
        if (!Array.isArray(order) || order.length === 0) {
            return res.status(400).json({ message: 'Field "order" harus berupa array id provider.' });
        }

        await prisma.$transaction(
            order.map((id: number, idx: number) =>
                prisma.aiProviderConfig.update({
                    where: { id: Number(id) },
                    data: { priority: idx + 1 },
                })
            )
        );

        const providers = await prisma.aiProviderConfig.findMany({
            orderBy: [{ priority: 'asc' }, { id: 'asc' }],
        });
        res.json({ message: 'Urutan provider berhasil disimpan.', data: providers.map(toPublic) });
    } catch (error) {
        console.error('[AI] reorderProviders error:', error);
        res.status(500).json({ message: 'Gagal menyimpan urutan provider.' });
    }
};

/**
 * POST /api/admin/ai/providers/:id/test
 * Uji koneksi ke provider: kirim 1 permintaan kecil, catat hasilnya.
 */
export const testProvider = async (req: any, res: Response) => {
    try {
        const id = Number(req.params.id);
        const p = await prisma.aiProviderConfig.findUnique({ where: { id } });
        if (!p) return res.status(404).json({ message: 'Provider tidak ditemukan.' });

        const apiKey = decryptKey(p.apiKeyEnc);
        if (!apiKey) return res.status(400).json({ message: 'API key tidak dapat didekripsi. Simpan ulang key-nya.' });

        const t0 = Date.now();
        let ok = false;
        let detail = '';

        try {
            if (p.provider === 'gemini') {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${p.model}:generateContent?key=${apiKey}`;
                const r = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] }),
                });
                const d: any = await r.json();
                ok = r.ok;
                detail = ok ? 'Koneksi berhasil' : (d?.error?.message || `HTTP ${r.status}`);
            } else {
                // OpenAI-compatible: panggil /chat/completions
                const base = (p.baseUrl || '').replace(/\/$/, '');
                const r = await fetch(`${base}/chat/completions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: p.model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 }),
                });
                const d: any = await r.json();
                ok = r.ok;
                detail = ok ? 'Koneksi berhasil' : (d?.error?.message || `HTTP ${r.status}`);
            }
        } catch (e: any) {
            ok = false;
            detail = e.message || 'Gagal menghubungi provider';
        }

        const latencyMs = Date.now() - t0;
        await prisma.aiProviderConfig.update({
            where: { id },
            data: { lastStatus: ok ? 'ok' : 'error', lastCheckedAt: new Date() },
        });

        res.json({
            ok,
            latencyMs,
            message: ok ? `✅ ${detail} (${latencyMs}ms)` : `❌ ${detail}`,
        });
    } catch (error) {
        console.error('[AI] testProvider error:', error);
        res.status(500).json({ message: 'Gagal menguji provider AI.' });
    }
};
