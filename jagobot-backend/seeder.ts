// backend/seeder.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // 1. Cari bot pertama yang aktif di database
    // Ini akan otomatis mengambil bot milik user yang login jika 
    // kamu menjalankan seeder saat sesi tersebut aktif, 
    // atau ambil bot terbaru yang terdaftar.
    // Mengambil bot terakhir yang dibuat oleh siapapun tanpa hardcode ID
    const bot = await prisma.bot.findFirst({
        orderBy: { id: 'desc' }
    });

    if (!bot) {
        console.error("❌ Error: Tidak ada bot ditemukan di database!");
        return;
    }

    const botId = bot.id; // Sekarang botId sudah terdefinisi secara dinamis
    const dummyLogs = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
        const randomDate = new Date(now.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));

        dummyLogs.push({
            botId: botId, // Menggunakan ID hasil pencarian otomatis
            customer_name: `Pelanggan ${i}`,
            pertanyaan: "Berapa harga produk ini?",
            jawaban: "Halo! Harganya mulai dari Rp100.000 saja.",
            response_time: Math.floor(Math.random() * (4000 - 500 + 1) + 500),
            timestamp: randomDate,
        });
    }

    await prisma.chatLog.createMany({ data: dummyLogs });

    // Sekarang console.log ini tidak akan merah lagi
    console.log(`✅ Berhasil menambahkan 20 data ke Bot: ${bot.nama_bot} (ID: ${botId})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });