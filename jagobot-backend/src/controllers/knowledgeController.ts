import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import prisma from '../lib/prisma';
// @ts-ignore
import pdf from 'pdf-parse-fork';
import mammoth from 'mammoth';
import { generateEmbedding } from '../lib/gemini';

// ✅ FUNGSI BARU: ekstrak teks berdasarkan tipe file
const extractText = async (filePath: string, originalName: string): Promise<string> => {
    const ext = path.extname(originalName).toLowerCase();

    if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(dataBuffer);
        return pdfData.text || "";

    } else if (ext === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || "";

    } else {
        throw new Error(`Format file tidak didukung: ${ext}. Gunakan PDF atau DOCX.`);
    }
};

// --- ✅ AMBIL DAFTAR FILE ---
export const getKnowledgeBaseList = async (req: Request, res: Response) => {
    try {
        const { botId } = req.query;

        if (!botId) {
            return res.status(400).json({ message: "botId diperlukan" });
        }

        const documents = await prisma.knowledgeBase.findMany({
            where: {
                botId: Number(botId),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json({
            status: 'success',
            data: documents,
        });
    } catch (error: any) {
        console.error('Fetch KB Error:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar dokumen' });
    }
};

export const ingestPDF = async (req: Request, res: Response) => {
    try {
        const { botId } = req.body;
        const file = req.file;

        console.log("DEBUG: Menerima botId:", botId);

        if (!file) return res.status(400).json({ message: "File tidak ditemukan" });

        const parsedBotId = parseInt(botId);
        if (isNaN(parsedBotId)) {
            return res.status(400).json({ message: "botId harus berupa angka" });
        }

        const fullText = await extractText(file.path, file.originalname);

        if (!fullText.trim()) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            throw new Error("File kosong atau tidak bisa dibaca teksnya.");
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });
        const chunks = await splitter.splitText(fullText);

        // ✅ Gunakan UPSERT agar tidak error jika file dengan nama yang sama sudah ada
        const kb = await prisma.knowledgeBase.upsert({
            where: {
                botId_nama_sumber: { botId: parsedBotId, nama_sumber: file.originalname }
            },
            update: {
                file_path: file.path,
                status: "ready",
                tipe_sumber: "file"
            },
            create: {
                botId: parsedBotId,
                nama_sumber: file.originalname,
                file_path: file.path,
                status: "ready",
                tipe_sumber: "file"
            }
        });

        // 2. Bersihkan Chunk lama (Penting agar data tidak ganda saat diupload ulang)
        await prisma.documentChunk.deleteMany({
            where: { knowledgeBaseId: kb.id }
        });

        // 3. Simpan Vektor (Sequential to avoid rate limit)
        for (const chunkContent of chunks) {
            const vector = await generateEmbedding(chunkContent);
            const vectorString = `[${vector.join(',')}]`;

            await prisma.$executeRaw`
                INSERT INTO "DocumentChunk" ("knowledgeBaseId", "content", "embedding")
                VALUES (${kb.id}, ${chunkContent}, ${vectorString}::vector)
            `;
        }

        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);

        res.status(200).json({
            success: true,
            message: "Knowledge base berhasil diproses!",
            totalChunks: chunks.length
        });

    } catch (error: any) {
        console.error("❌ Error Ingestion:", error.message);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ 
            success: false,
            message: error.message || "Terjadi kesalahan saat memproses dokumen",
            error: error.message 
        });
    }
};

// ✅ Hapus data Knowledge Base dan Chunks terkait
export const deleteKnowledgeBase = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "ID dokumen diperlukan" });
        }

        const document = await prisma.knowledgeBase.findUnique({
            where: { id: Number(id) }
        });

        if (!document) {
            return res.status(404).json({ message: "Dokumen tidak ditemukan" });
        }

        await prisma.knowledgeBase.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({
            status: 'success',
            message: `Dokumen "${document.nama_sumber}" berhasil dihapus dari sistem.`
        });
    } catch (error: any) {
        console.error('Delete KB Error:', error);
        res.status(500).json({ message: 'Gagal menghapus dokumen', error: error.message });
    }
};

// --- ✅ PENYESUAIAN FUNGSI INGEST MANUAL TEXT (DENGAN UPSERT & EDIT LOGIC) ---
export const ingestManualText = async (req: any, res: any) => {
    try {
        const { botId, title, content } = req.body; // Tambahkan 'title' untuk identifikasi unik

        if (!botId || !title || !content) {
            return res.status(400).json({ message: "Data tidak lengkap (botId, title, content diperlukan)" });
        }

        const parsedBotId = parseInt(botId);

        // 1. Simpan/Update KnowledgeBase menggunakan UPSERT
        const kb = await prisma.knowledgeBase.upsert({
            where: {
                // Pastikan di schema.prisma kamu sudah ada @@unique([botId, nama_sumber])
                botId_nama_sumber: { botId: parsedBotId, nama_sumber: title }
            },
            update: {
                isi_teks: content,
                status: "ready"
            },
            create: {
                botId: parsedBotId,
                nama_sumber: title,
                tipe_sumber: "text",
                isi_teks: content,
                file_path: "manual-input",
                status: "ready"
            }
        });

        // 2. Bersihkan Chunk lama (Penting agar data tidak ganda saat diedit)
        await prisma.documentChunk.deleteMany({
            where: { knowledgeBaseId: kb.id }
        });

        // 3. Proses Chunking (Memecah teks manual)
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });
        const chunks = await splitter.splitText(content);

        // 4. Generate Embedding dan Simpan ke DocumentChunk (Sequential)
        for (const chunkContent of chunks) {
            const vector = await generateEmbedding(chunkContent);
            const vectorString = `[${vector.join(',')}]`;

            await prisma.$executeRaw`
                INSERT INTO "DocumentChunk" ("knowledgeBaseId", "content", "embedding")
                VALUES (${kb.id}, ${chunkContent}, ${vectorString}::vector)
            `;
        }

        res.status(200).json({
            success: true,
            message: "Informasi manual berhasil disimpan/diperbarui!",
            data: kb,
            totalChunks: chunks.length
        });

    } catch (error: any) {
        console.error("Error Manual Ingestion:", error);
        res.status(500).json({ message: "Gagal menyimpan teks manual", error: error.message });
    }
};

// --- ✅ AMBIL SINGLE KNOWLEDGE BASE BY ID ---
export const getKnowledgeBaseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        console.log("DEBUG: Fetching KB with ID:", id);

        if (!id) {
            return res.status(400).json({ 
                success: false,
                message: "ID dokumen diperlukan" 
            });
        }

        const document = await prisma.knowledgeBase.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!document) {
            return res.status(404).json({ 
                success: false,
                message: "Dokumen tidak ditemukan" 
            });
        }

        console.log("DEBUG: KB found:", document.id);

        res.status(200).json({
            success: true,
            status: 'success',
            data: document
        });
    } catch (error: any) {
        console.error('❌ Fetch KB By ID Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil dokumen',
            error: error.message 
        });
    }
};

// --- ✅ UPDATE KNOWLEDGE BASE (Manual Text) ---
export const updateKnowledgeBase = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        console.log("DEBUG Update KB - ID:", id, "Title:", title, "Content length:", content?.length);

        if (!id || !title || !content) {
            return res.status(400).json({ 
                success: false,
                message: "ID, title, dan content diperlukan" 
            });
        }

        // 1. Update KnowledgeBase metadata
        const kb = await prisma.knowledgeBase.update({
            where: {
                id: Number(id)
            },
            data: {
                nama_sumber: title,
                isi_teks: content,
                status: "ready"
            }
        });

        console.log("DEBUG: KB updated successfully:", kb.id);

        // 2. Bersihkan chunk lama
        await prisma.documentChunk.deleteMany({
            where: { knowledgeBaseId: kb.id }
        });

        // 3. Proses chunking dan generate embedding
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });
        const chunks = await splitter.splitText(content);

        console.log("DEBUG: Total chunks created:", chunks.length);

        // 4. Simpan chunk baru dengan embedding (Sequential)
        for (const chunkContent of chunks) {
            const vector = await generateEmbedding(chunkContent);
            const vectorString = `[${vector.join(',')}]`;

            await prisma.$executeRaw`
                INSERT INTO "DocumentChunk" ("knowledgeBaseId", "content", "embedding")
                VALUES (${kb.id}, ${chunkContent}, ${vectorString}::vector)
            `;
        }

        console.log("DEBUG: All chunks inserted successfully");

        res.status(200).json({
            success: true,
            status: 'success',
            message: "Dokumen berhasil diperbarui!",
            data: kb,
            totalChunks: chunks.length
        });
    } catch (error: any) {
        console.error('❌ Update KB Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal memperbarui dokumen', 
            error: error.message 
        });
    }
};