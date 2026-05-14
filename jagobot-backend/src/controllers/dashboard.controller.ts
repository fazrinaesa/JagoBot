import prisma from '../lib/prisma';

export const getActiveBot = async (req: any, res: any) => {
    try {
        const idDariToken = (req as any).user.userId || (req as any).user.id;
        const { botId } = req.query;

        console.log("DEBUG: User ID dari Token adalah:", idDariToken);
        console.log("DEBUG: Query botId dari Frontend adalah:", botId);

        let bot;

        if (botId) {
            // ✅ FIX: Jika frontend mengirim botId, kembalikan bot tersebut
            // dengan verifikasi kepemilikan (ownership) untuk keamanan
            bot = await prisma.bot.findFirst({
                where: {
                    id: Number(botId),
                    userId: Number(idDariToken) // pastikan bot milik user ini
                }
            });

            if (!bot) {
                console.warn(`⚠️ Bot ID ${botId} tidak ditemukan atau bukan milik user ${idDariToken}`);
                // Fallback: ambil bot pertama milik user jika botId tidak valid
                bot = await prisma.bot.findFirst({
                    where: { userId: Number(idDariToken) },
                    orderBy: { id: 'asc' }
                });
            } else {
                console.log(`✅ Bot ditemukan via query botId: ${bot.id} - ${bot.nama_bot}`);
            }
        } else {
            // Fallback behaviour: ambil bot pertama milik user (jika tidak ada botId)
            bot = await prisma.bot.findFirst({
                where: { userId: Number(idDariToken) },
                orderBy: { id: 'asc' }
            });
        }

        if (!bot) {
            return res.status(404).json({ message: "Bot tidak ditemukan" });
        }

        res.json(bot);
    } catch (error) {
        res.status(500).json({ message: "Gagal mendeteksi bot" });
    }
};

export const getUserBots = async (req: any, res: any) => {
    try {
        const idDariToken = (req as any).user.userId || (req as any).user.id;

        console.log("DEBUG getUserBots: User ID dari Token adalah:", idDariToken);

        const bots = await prisma.bot.findMany({
            where: {
                userId: Number(idDariToken)
            },
            orderBy: { id: 'desc' }
        });

        res.status(200).json({ data: bots });
    } catch (error: any) {
        console.error("Error getUserBots:", error);
        res.status(500).json({ message: "Gagal mengambil daftar bot", error: error.message });
    }
};

export const createBot = async (req: any, res: any) => {
    try {
        console.log("═══════════════════════════════════════════════════════");
        console.log("🟦 [Backend] CreateBot Request Received");
        console.log("═══════════════════════════════════════════════════════");
        
        // Ambil userId dari token sesuai struktur middleware auth kamu
        const idDariToken = (req as any).user.userId || (req as any).user.id;
        // Ambil nama_bot dari request body
        const { nama_bot } = req.body;

        console.log("👤 User ID dari Token:", idDariToken);
        console.log("🏷️  Bot Name dari Request Body:", nama_bot);
        console.log("📦 Full Request Body:", req.body);

        if (!nama_bot || nama_bot.trim() === '') {
            console.error("❌ Bot name is empty!");
            return res.status(400).json({ message: "Nama bot tidak boleh kosong" });
        }

        console.log("✅ Validasi nama bot OK, creating bot in database...");

        // Simpan bot baru ke database
        const newBot = await prisma.bot.create({
            data: {
                userId: Number(idDariToken),
                nama_bot: nama_bot.trim(),
                personality: "Ramah",
                whatsapp_linked: false
            }
        });

        console.log("✅ Bot created successfully in database");
        console.log("🔑 New Bot ID:", newBot.id);
        console.log("📋 New Bot Data:", newBot);

        // Mengembalikan status 201 (Created) beserta data bot (termasuk ID baru)
        const responsePayload = {
            message: "Bot berhasil dibuat",
            data: { bot: newBot },
            id: newBot.id
        };

        console.log("📤 Sending response:", responsePayload);
        console.log("═══════════════════════════════════════════════════════\n");

        res.status(201).json(responsePayload);
    } catch (error: any) {
        console.error("═══════════════════════════════════════════════════════");
        console.error("🔴 [Backend] Error in createBot:");
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);
        console.error("═══════════════════════════════════════════════════════\n");
        
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};