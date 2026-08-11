import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generateEmbedding, generateChatCompletion } from '../lib/llm';
import { recordTokenUsage, estimateTokens } from '../middleware/quotaMiddleware';

export const handleIncomingChat = async (req: Request, res: Response) => {
    try {
        console.log("═══════════════════════════════════════════════════════");
        console.log("💬 [Backend] Chat Request Received");
        console.log("═══════════════════════════════════════════════════════");

        const { botId, customerName, message } = req.body;

        console.log("🤖 Bot ID:", botId);
        console.log("👤 Customer Name:", customerName);
        console.log("💭 Message:", message);

        const startTime = Date.now();

        // 1. AMBIL DATA IDENTITAS BOT TERBARU (Personality & Instructions)
        console.log("📋 Fetching bot data from database...");
        const botData = await prisma.bot.findUnique({
            where: { id: Number(botId) }
        });

        if (!botData) {
            console.error("❌ Bot not found with ID:", botId);
            return res.status(404).json({ status: "error", message: "Bot tidak ditemukan" });
        }

        const namaBot = botData?.nama_bot || "JagoBot";
        const gayaBahasa = botData?.personality || "Ramah";
        const instruksiKhusus = botData?.instructions || "Jawab dengan sopan.";

        console.log("✅ Bot data found:", { namaBot, gayaBahasa });

        // --- ✅ PROSES RAG: MENGAMBIL KONTEKS TERBARU DARI DATABASE ---
        // Kita mengambil knowledge yang statusnya 'ready' milik bot ini
        console.log("📚 Fetching knowledge base for bot...");
        const allKbs = await prisma.knowledgeBase.findMany({
            where: { botId: Number(botId), status: "ready" }
        });

        console.log("📂 Knowledge Base count:", allKbs.length);

        let contextText = "";
        if (allKbs.length > 0) {
            // Generate embedding untuk pertanyaan user saat ini
            const queryVector = await generateEmbedding(message);

            const allMatches: any[] = [];
            for (const kb of allKbs) {
                // Mencari potongan teks (chunks) yang paling relevan dengan pertanyaan
                const matches: any = await prisma.$queryRaw`
                    SELECT content, similarity 
                    FROM match_document_chunks(
                        ${queryVector}::vector, 
                        ${0.2}::float8, 
                        ${5}::int, 
                        ${kb.id}::bigint
                    );
                `;
                allMatches.push(...matches);
            }

            // Urutkan berdasarkan tingkat kemiripan (similarity) tertinggi
            allMatches.sort((a, b) => b.similarity - a.similarity);

            // Ambil top 5 potongan teks untuk memberikan konteks yang lebih kaya
            contextText = allMatches.slice(0, 5).map((m: any) => m.content).join("\n\n");
        }

        // --- ✅ PROSES GENERASI JAWABAN OLEH LLM (9router → Gemini fallback) ---
        const systemPrompt = `
            SISTEM / IDENTITAS:
            Anda adalah ${namaBot}, asisten cerdas untuk UMKM.
            Gaya bahasa yang WAJIB Anda gunakan: ${gayaBahasa}.
            Instruksi Khusus dari pemilik toko: "${instruksiKhusus}".

            REFERENSI UTAMA (Gunakan data di bawah ini untuk menjawab):
            ---
            ${contextText || "Tidak ada dokumen spesifik yang ditemukan di database."}
            ---

            TUGAS & ATURAN:
            1. Jika jawaban ada di REFERENSI UTAMA, jawablah dengan detail menggunakan gaya bahasa ${gayaBahasa}.
            2. Jika jawaban TIDAK ADA di referensi, jawablah: "Mohon maaf, saya belum memiliki informasi mengenai hal tersebut," lalu tawarkan bantuan lain sesuai gaya ${gayaBahasa}.
            3. JANGAN mengarang informasi (halusinasi) di luar referensi yang diberikan.
            4. Selalu ikuti instruksi khusus: "${instruksiKhusus}".
        `;

        const aiResponse = await generateChatCompletion({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            temperature: 0.4,
        });

        console.log("🤖 AI Response generated");
        console.log("💬 Response text:", aiResponse.substring(0, 100) + "...");

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log("⏱️  Response time:", duration, "ms");

        // 3. SIMPAN KE CHATLOG (Untuk memantau performa bot di Dashboard)
        // ✅ Disesuaikan dengan field aktif di database
        console.log("💾 Saving chat log to database...");
        const tokenCount = estimateTokens(message) + estimateTokens(aiResponse);
        const newChat = await prisma.chatLog.create({
            data: {
                botId: Number(botId),
                userMessage: message,
                aiResponse: aiResponse,
                platform: customerName || "Pelanggan",
                response_time_ms: duration,
                tokenCount
            }
        });

        // Record token usage against subscription quota
        const userId = (req as any).user?.id || (req as any).user?.userId;
        if (userId) {
            recordTokenUsage(Number(userId), tokenCount).catch(err =>
                console.warn('[Quota] Failed to record token usage:', err.message)
            );
        }

        console.log("✅ Chat log saved with ID:", newChat.id);

        const responsePayload = {
            status: "success",
            data: newChat
        };

        console.log("📤 Sending response:", responsePayload.status);
        console.log("═══════════════════════════════════════════════════════\n");

        res.status(200).json(responsePayload);

    } catch (error: any) {
        console.error("═══════════════════════════════════════════════════════");
        console.error("❌ [Backend] Chat Error:", error.message);
        console.error("Error Stack:", error.stack);
        console.error("═══════════════════════════════════════════════════════\n");
        res.status(500).json({ message: "Gagal memproses pesan", error: error.message });
    }
};