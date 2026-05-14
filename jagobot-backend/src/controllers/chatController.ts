import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generateEmbedding } from '../lib/gemini';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const generateWithRetry = async (model: any, prompt: string, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return result;
        } catch (error: any) {
            if (error.message?.includes('429') && i < maxRetries - 1) {
                const waitTime = (i + 1) * 10000;
                console.log(`Rate limited. Retrying in ${waitTime / 1000}s... (attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                throw error;
            }
        }
    }
};

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

        // --- ✅ PROSES GENERASI JAWABAN OLEH GEMINI ---
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });        // 2. CONTEXT INJECTION: Menyuntikkan hasil pencarian ke dalam prompt
        const prompt = `
            SISTEM / IDENTITAS:
            Anda adalah ${namaBot}, asisten cerdas untuk UMKM.
            Gaya bahasa yang WAJIB Anda gunakan: ${gayaBahasa}.
            Instruksi Khusus dari pemilik toko: "${instruksiKhusus}".

            REFERENSI UTAMA (Gunakan data di bawah ini untuk menjawab):
            ---
            ${contextText || "Tidak ada dokumen spesifik yang ditemukan di database."}
            ---

            PENGGUNA:
            Nama Customer: ${customerName || "Pelanggan"}
            Pertanyaan: "${message}"

            TUGAS & ATURAN:
            1. Jika jawaban ada di REFERENSI UTAMA, jawablah dengan detail menggunakan gaya bahasa ${gayaBahasa}.
            2. Jika jawaban TIDAK ADA di referensi, jawablah: "Mohon maaf, saya belum memiliki informasi mengenai hal tersebut," lalu tawarkan bantuan lain sesuai gaya ${gayaBahasa}.
            3. JANGAN mengarang informasi (halusinasi) di luar referensi yang diberikan.
            4. Selalu ikuti instruksi khusus: "${instruksiKhusus}".
        `;

        const result = await generateWithRetry(model, prompt);

        if (!result) throw new Error("Gagal mendapatkan respon dari AI");

        const response = await result.response;
        const aiResponse = response.text();

        console.log("🤖 AI Response generated");
        console.log("💬 Response text:", aiResponse.substring(0, 100) + "...");

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log("⏱️  Response time:", duration, "ms");

        // 3. SIMPAN KE CHATLOG (Untuk memantau performa bot di Dashboard)
        // ✅ Disesuaikan dengan field aktif di database
        console.log("💾 Saving chat log to database...");
        const newChat = await prisma.chatLog.create({
            data: {
                botId: Number(botId),
                userMessage: message,
                aiResponse: aiResponse,
                platform: customerName || "Pelanggan",
                response_time_ms: duration
            }
        });

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