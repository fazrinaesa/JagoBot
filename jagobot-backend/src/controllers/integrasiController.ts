import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generateChatCompletion } from '../lib/llm';

/**
 * Controller untuk menangani interaksi chat publik dari Widget Web (Live Chat)
 * Tanpa memerlukan middleware autentikasi JWT token.
 */
export const handlePublicChat = async (req: Request, res: Response) => {
    try {
        const { botId, customerName, message } = req.body;

        // 1. Validasi input dasar dari request body widget
        if (!botId || !message) {
            return res.status(400).json({
                message: "botId dan message wajib diisi."
            });
        }

        // 2. Validasi keberadaan Bot berdasarkan id (Int) di database
        const bot = await prisma.bot.findUnique({
            where: { id: Number(botId) }
        });

        if (!bot) {
            return res.status(404).json({
                message: "Bot tidak ditemukan atau status tidak aktif."
            });
        }

        // 3. Logika RAG (Retrieval-Augmented Generation) - Mengambil Konteks Knowledge Base
        const knowledgeBases = await prisma.knowledgeBase.findMany({
            where: {
                botId: Number(botId)
            },
            select: {
                id: true,
                isi_teks: true
            }
        });

        // Ekstraksi ID menjadi bentuk array angka biasa, contoh: [1, 2]
        const kbIds = knowledgeBases.map(kb => kb.id);

        let relevantChunks: any[] = [];
        // Jika bot memiliki dokumen di knowledge base, tarik potongan text chunks-nya
        if (kbIds.length > 0) {
            relevantChunks = await prisma.documentChunk.findMany({
                where: {
                    knowledgeBaseId: {
                        in: kbIds
                    }
                },
                take: 10
            });
        }

        // PENYESUAIAN UTAMA: Selalu gabungkan isi_teks + DocumentChunk sebagai konteks
        const isiTeksContext = knowledgeBases
            .map(kb => kb.isi_teks)
            .filter(Boolean)
            .join("\n");

        const chunkContext = relevantChunks
            .map(chunk => chunk.content)
            .join("\n");

        // Gabungkan keduanya
        const contextText = [isiTeksContext, chunkContext]
            .filter(Boolean)
            .join("\n") || "Tidak ada data spesifik mengenai pertanyaan ini di dokumen internal toko.";

        // 4. Menyusun Prompt System Instruction terstruktur untuk LLM (9router → Gemini fallback)
        const aiSystemInstruction = `
    Anda adalah ${bot.nama_bot}, sebuah asisten AI resmi untuk toko online ini.
    Personality/Gaya Bahasa Anda: ${bot.personality}.
    Instruksi tambahan: ${bot.instructions || 'Layani pelanggan dengan ramah, santun, dan solutif.'}.

    Gunakan informasi di bawah ini (KONTEKS TOKO) untuk menjawab pertanyaan pelanggan secara akurat.
    Aturan Penting:
    1. Jawablah hanya berdasarkan fakta yang tertulis di dalam KONTEKS TOKO di bawah.
    2. Jika informasi atau jawaban dari pertanyaan pelanggan TIDAK ADA di dalam KONTEKS TOKO, jawablah dengan sopan bahwa Anda belum mengetahui informasi tersebut dan arahkan pelanggan untuk langsung menghubungi admin/owner toko melalui WhatsApp.
    3. Jangan pernah mengarang data atau berhalusunasi di luar konteks yang diberikan.

    KONTEKS TOKO:
    ${contextText}
            `.trim();

        // Memanggil LLM (9router primary → Gemini fallback)
        const replyMessage = await generateChatCompletion({
            messages: [
                { role: 'system', content: aiSystemInstruction },
                { role: 'user', content: message }
            ],
            temperature: 0.4,
        }).catch(() => "Maaf, saya sedang tidak bisa memproses pesan Anda.");

        // 5. Menyimpan riwayat obrolan pelanggan (ChatLog) ke dalam database untuk analitik dashboard
        await prisma.chatLog.create({
            data: {
                botId: Number(botId),
                platform: "widget_web",
                userMessage: message,
                aiResponse: replyMessage
            }
        });

        // 6. Mengirimkan response sukses berupa format JSON balik menuju website client
        return res.json({
            botId: Number(botId),
            customerName: customerName || "Pelanggan JagoBot",
            reply: replyMessage
        });

    } catch (error: any) {
        console.error("❌ ERROR PUBLIC CHAT INTERACTION:", error);

        return res.status(500).json({
            message: "Internal server error pada sistem AI JagoBot.",
            error: error.message
        });
    }
};